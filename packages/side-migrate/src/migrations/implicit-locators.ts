// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { Commands, ArgTypes, ProjectShape } from '@seleniumhq/side-model'
import { CommandKey } from '@seleniumhq/side-model/dist/Commands'

export default function migrate(project: ProjectShape) {
  let r = Object.assign({}, project)
  r.tests = r.tests.map((test) => {
    return Object.assign({}, test, {
      commands: test.commands.map((c) => {
        if (c.command in Commands) {
          let newCmd = Object.assign({}, c)
          const type = Commands[c.command as CommandKey]
          if ('target' in type && type.target.name === ArgTypes.locator.name) {
            newCmd.target = migrateLocator(newCmd.target as string)
          }
          if ('value' in type && type.value.name === ArgTypes.locator.name) {
            newCmd.value = migrateLocator(newCmd.value as string)
          }
          if (newCmd.targets) {
            newCmd.targets = newCmd.targets.map((targetTuple) => [
              migrateLocator(targetTuple[0]),
              targetTuple[1],
            ])
          }
          return newCmd
        }
        return c
      }),
    })
  })
  return r
}

function migrateLocator(locator: string) {
  const result = locator.match(/^([A-Za-z]+)=.+/)
  if (!result) {
    const implicitType = locator.indexOf('//') === -1 ? 'id' : 'xpath'
    return `${implicitType}=${locator}`
  }
  return locator
}

migrate.version = '1.1'
