#!/usr/bin/env node
import { Command } from 'commander'
import figlet from 'figlet'
// import { sum } from './businessLogic'
import { version, description } from '../package.json'

export interface ICliOptions {
  a: string
  b: string
}

console.log(figlet.textSync('Sum Calculator'))

const program = new Command()

program
  .version(version)
  .description(description)
  .requiredOption('-a <value>')
  .requiredOption('-b <value>')
  .parse(process.argv)

const { a, b } = program.opts<ICliOptions>()

void (async () => {
  const addendA = parseFloat(a)
  const addendB = parseFloat(b)
  if (isNaN(addendA) || isNaN(addendB)) throw new Error('A and B must be numbers')
  const c = sum(addendA, addendB)
  console.log(`${addendA} + ${addendB} = ${c}`)
})()
