export class GameEvent {
  type: string
  entities: number[]

  constructor(type: string, entities: number[]) {
    this.type = type
    this.entities = entities
  }
}
