import React, { FormEvent } from "react"

type MyProps = {}
type MyState = {
  domain: string | null
}
export class CreatePropertyForm extends React.Component<MyProps, MyState> {
  constructor(props: any) {
    super(props)
    this.state = {
      domain: null,
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event: FormEvent) {
    const t = event.target as HTMLInputElement
    this.setState({
      ...this.state,
      [t.name]: t.value,
    })
  }
  async handleSubmit(event: FormEvent) {
    event.preventDefault()
    const response = await fetch("/api/property/create", {
      headers: {},
      method: "POST",
      body: JSON.stringify(this.state),
    })
    console.log(response)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <label className="section-header" htmlFor="domain">
            Domain
          </label>
          <input
            name="domain"
            id="domain"
            type="text"
            placeholder="example.com"
            autoComplete="off"
            onChange={this.handleChange}
          />
        </div>
        <input type="submit" value="Submit" />
      </form>
    )
  }
}
