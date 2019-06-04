export default class Blocker {

  public promise: Promise<any>
  public resolve: Function
  public reject: Function

  constructor(
    public controlId: string,
    public eventType: string,
    public resolver: Function
  ) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}
