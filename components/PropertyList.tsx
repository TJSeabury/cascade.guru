import { uniqueId } from "lodash"
import { Property } from "@prisma/client"

interface Props {
  propertyList: Property[]
}

export default function PropertyList({ propertyList }: Props) {
  return (
    <ul>
      <figure
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong>ID</strong>
        </div>
        <div>
          <strong>Domain</strong>
        </div>
        <div>
          <strong>API Key</strong>
        </div>
      </figure>
      {propertyList?.map((propterty) => (
        <li key={uniqueId("user_")}>
          <figure
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span>{propterty.id}</span>
            </div>
            <div>
              <span>{propterty.domain}</span>
            </div>
            <div>
              <span>{propterty.apiKey}</span>
            </div>
          </figure>
        </li>
      ))}
    </ul>
  )
}
