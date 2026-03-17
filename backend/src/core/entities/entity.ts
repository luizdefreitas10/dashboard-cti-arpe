export class UniqueEntityID {
  private value: string

  toString() {
    return this.value
  }

  toValue() {
    return this.value
  }

  constructor(value?: string) {
    this.value = value ?? crypto.randomUUID()
  }

  equals(id: UniqueEntityID) {
    return id.toValue() === this.value
  }
}

export abstract class Entity<Props> {
  private _id: UniqueEntityID
  protected props: Props

  get id() {
    return this._id
  }

  protected constructor(props: Props, id?: UniqueEntityID) {
    this._id = id ?? new UniqueEntityID()
    this.props = props
  }

  equals(entity: Entity<unknown>) {
    if (entity === this) return true
    if (entity.id === this._id) return true
    return entity.id.equals(this._id)
  }
}
