import React, { Component } from "react"
import metadata from "./metadata";
import PageBorder from "./PageBorder";
import ContentEditable from './ContentEditable'

export default class Page extends Component {
  state = {
    spreadHeight:0,
    spreadWidth: 0
  }

  onContentChange = (e) => {}

  componentDidMount() {
    const spread = document.querySelector(`#${this.props.spreadId}`);

    this.setState({
      spreadHeight: spread.clientHeight / 2,
      spreadWidth: spread.clientWidth / 2
    })
  }

  render() {
    const page = this.props.page;
    const { spreadHeight, spreadWidth } = this.state;
    
    return (
      <div id={`page_${page.id}`} className={parseInt(page.name) % 2 === 0 ? "pageOdd" : "pageEven"}  style={{ position: "absolute", width: `${page.geometric_bound[3]}px`,  height: `${page.geometric_bound[2]}px`, top: `${spreadHeight}px`, left: `${spreadWidth}px`, transform: `matrix(${page.item_transform})`}}>
        <ContentEditable
          html="<div><br /></div>"
          id={`editable_${page.id}`}
          className="editable"
          page={page}
          onChange={this.onContentChange}
          style={{
            width: `${page.geometric_bound[3] - page.margins.Left - page.margins.Right}px`,
            height: `${page.geometric_bound[2] - page.margins.Top - page.margins.Bottom}px`, 
            top: `${page.margins.Top}px`, 
            left: `${page.margins.Left}px`,
          }}
        />
        
        <PageBorder page={page} />
      </div>
    )
  }
}