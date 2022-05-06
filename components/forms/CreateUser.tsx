import React, { FormEvent } from "react"
import Select from "react-select"

type MyProps = {}
type MyState = {
  forename: string | null
  surname: string | null
  email: string | null
  userRole: string | null
  password: string | null
}
export class CreateUserForm extends React.Component<MyProps, MyState> {
  constructor(props: any) {
    super(props)
    this.state = {
      forename: null,
      surname: null,
      email: null,
      userRole: null,
      password: null,
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
    const response = await fetch("/api/admin/createuser", {
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
          <label className="section-header" htmlFor="forename">
            User Role
          </label>
          <Select
            name="userRole"
            id="UserRole"
            options={[
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
            ]}
            onChange={(v) => {
              this.setState({
                ...this.state,
                userRole: v?.value || null,
              })
              console.log(this.state)
            }}
          />
        </div>
        <div>
          <label className="section-header" htmlFor="forename">
            Forename
          </label>
          <input
            name="forename"
            id="forename"
            type="text"
            placeholder="John"
            autoComplete="off"
            onChange={this.handleChange}
          />
        </div>
        <div>
          <label className="section-header" htmlFor="surename">
            Surname
          </label>
          <input
            name="surname"
            id="surname"
            type="text"
            placeholder="Smith"
            autoComplete="off"
            onChange={this.handleChange}
          />
        </div>
        <div>
          <label className="section-header" htmlFor="email">
            Email
          </label>
          <input
            name="email"
            id="email"
            type="text"
            placeholder="wickedfirename@emailer.com"
            autoComplete="off"
            onChange={this.handleChange}
          />
        </div>
        <div>
          <label className="section-header" htmlFor="password">
            Password
          </label>
          <input
            name="password"
            id="password"
            type="password"
            autoComplete="off"
            onChange={this.handleChange}
          />
        </div>
        <input type="submit" value="Submit" />
      </form>
    )
  }
}
