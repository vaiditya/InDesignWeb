import React, { Component } from "react"
import Page from "./Page"
import metadata from "./metadata";

const SPREAD_HEIGHT = "144px"
const SPREAD_WIDTH = 4

export default class Spread extends Component {
  render() {
    const spreads = this.props.spreads;

    return (
      <div className={`spread`} id={spreads} style={{ height: `calc(${metadata[spreads].pages[0].geometric_bound[2]}px + ${SPREAD_HEIGHT})`, width: `calc(${metadata[spreads].pages[0].geometric_bound[3]}px * ${SPREAD_WIDTH})`}}>
        {metadata[spreads].pages.map(page => {
          return <Page key={page.id} spreadId={spreads} page={page}/>
        })}
      </div>
    )
  }
}