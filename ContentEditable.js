import React, { Component } from "react";
import PropTypes from "prop-types"

export class Caret {
    /**
     * get/set caret position
     * @param {HTMLColletion} target 
     */
    constructor(target) {
        this.isContentEditable = target && target.contentEditable
        this.target = target
    }
    /**
     * get caret position
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range}
     * @returns {number}
     */
    getPos() {
        // for contentedit field
        if (this.isContentEditable) {
            this.target.focus()
            let _range = document.getSelection().getRangeAt(0)
            let range = _range.cloneRange()
            range.selectNodeContents(this.target)
            range.setEnd(_range.endContainer, _range.endOffset)
            return range.toString().length;
        }
        // for texterea/input element
        return this.target.selectionStart
    }

    /**
     * set caret position
     * @param {number} pos - caret position
     */
    setPos(pos) {
        // for contentedit field
        if (this.isContentEditable) {
            this.target.focus()
            document.getSelection().collapse(this.target, pos)
            return
        }
        this.target.setSelectionRange(pos, pos)
    }
}

function normalizeHtml(str) {
  return str && str.replace(/&nbsp;|\u202F|\u00A0/g, ' ');
}

export default class ContentEditable extends Component {
  static propTypes = {
    html: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyUp: PropTypes.func,
    onKeyDown:  PropTypes.func,
    disabled: PropTypes.bool,
    tagName: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    innerRef: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ])
  }

  currentCaretPosition = 0;
  previousCaretPosition = 0;

  el = typeof this.props.innerRef === 'function' ? { current: null } : React.createRef();
  getEl = () => (this.props.innerRef && typeof this.props.innerRef !== 'function' ? this.props.innerRef : this.el).current;

  moveFocus = (el, position, start = true) => {
    let range = document.createRange();
    let sel = window.getSelection();
    range.setStart(el, position);
    range.collapse(start);
    sel.removeAllRanges();
    sel.addRange(range);
  }

 
  emitKeyup = (e) => {
    
   

    let currentEditableElId=`editable_${this.props.page.id}`;
    let nextEditableElId=`editable_${this.props.page.next_page}`;
    let currentPageEl=this.getEl();
   
    let nextEditableEl = document.getElementById(nextEditableElId)
    
    
    
      // console.log(nextEditableEl)
      // console.log(nextEditableEl.clientHeight)
    if (!currentPageEl) return;

    const selection = window.getSelection();
    
    if(selection.anchorNode.offsetTop === undefined) {
      this.currentCaretPosition = selection.anchorNode.parentNode ? selection.anchorNode.parentNode.offsetTop + selection.anchorNode.parentNode.offsetHeight: 0
    } else {
      this.currentCaretPosition = selection.anchorNode ? selection.anchorNode.offsetTop + selection.anchorNode.offsetHeight: 0
    }

    if(e.keyCode === 8) {
      if(selection.anchorNode.offsetTop !== undefined && selection.anchorNode.offsetTop === 0) {
        e.preventDefault();
        const previousEditableEl = document.getElementById(`editable_${this.props.page.prev_page}`)
        if(this.props.page.prev_page!==null){
        previousEditableEl.focus()
        this.moveFocus(previousEditableEl, previousEditableEl.childElementCount - 1, true)
        }
      } else {
        if(selection.anchorNode.offsetTop === undefined) {
          console.log("parentNode: ", selection.anchorNode.parentNode.offsetTop)
          // if user have typed something and reached to the first line by erasing all the words
          if(selection.anchorOffset - 1 === 0 && selection.anchorNode.parentNode.offsetTop === 0) {
            e.preventDefault()
            const previousEditableEl = document.getElementById(`editable_${this.props.page.prev_page}`)
            console.log("Remove node from child and append it to parent ...!")
            if(currentPageEl.childElementCount === 1) {
              currentPageEl.innerHTML = "<div><br></div>"
            } else {
              currentPageEl.removeChild(currentPageEl.firstChild)
            }
            previousEditableEl.focus()
            this.moveFocus(previousEditableEl, previousEditableEl.childElementCount, false)
          // if user have typed something and taken cursor back to start position on first line
          } else if(selection.anchorOffset - 1 === -1 && selection.anchorNode.parentNode.offsetTop === 0) {
            e.preventDefault()
            console.log("Remove text from behind the cursor and append it to the parent ...!")
            const previousEditableEl = document.getElementById(`editable_${this.props.page.prev_page}`)
            const currentFirstChildNode = currentPageEl.firstChild
            previousEditableEl.appendChild(currentFirstChildNode)
            if(currentPageEl.childElementCount === 0) {
              currentPageEl.innerHTML = "<div><br></div>"
            }
            previousEditableEl.focus()
            this.moveFocus(previousEditableEl, previousEditableEl.childElementCount - 1, true)
          }
        } else {
          console.log("anchorNode: ", selection.anchorNode.offsetTop)
          // Not having any parent nodes : ideally first page of the document
          if(selection.anchorNode.offsetTop === 0) {
            e.preventDefault()
          }
        }
      }
    }

    // Restrict enter key stroke at the endline of last page
    if (this.props.page.next_page===null && e.keyCode === 13 ){
      const currentEditableEl = document.getElementById(`editable_${this.props.page.id}`)
      const currentPageElHeight = currentPageEl.clientHeight

      let currentEditableElHeight = currentPageEl.lastChild ? currentPageEl.lastChild.offsetHeight + currentPageEl.lastChild.offsetTop: 0
      
       if(currentEditableElHeight >= currentPageElHeight) {
         e.preventDefault();
       }
    }

    
    if(this.currentCaretPosition !== this.previousCaretPosition ) {
      let i=0;
      let spaceFound = false;
      let selection = window.getSelection()
      let enteredTriggeredLoc=selection.anchorNode;
      let enteredTriggeredLast=nextEditableElfirstChild
      // console.log("entered",enteredTriggeredLoc)
      // this.moveFocus(currentPageEl.lastElementChild, nextEditableEl.lastElementChild.innerHTML)
      

      while (i<4 && !spaceFound){
        // console.log(currentPageEl,nextEditableEl)//page elements is changing on overflow when entered from between
        console.log("while",i)
      const currentPageElHeight = currentPageEl.clientHeight

      // Current Editable reference
      const currentEditableEl = document.getElementById(currentEditableElId)
      let currentEditableElHeight = currentPageEl.lastChild ? currentPageEl.lastChild.offsetHeight + currentPageEl.lastChild.offsetTop: 0
      
      // if(this.props.page.next_page!==null){
        // Next Editable reference
        // const nextEditableEl = document.getElementById(nextEditableElId)
        const nextEditableElHeight = nextEditableEl.clientHeight
        
        
        let currentPageItem = []
        let nextPageItem = []


        if(currentEditableElHeight > currentPageElHeight) {
          // while(i<10  && !spaceFound){
      
          
          let currentEditableElLastChild = currentEditableEl.lastChild
          let nextEditableElfirstChild = nextEditableEl.firstChild
          

          if(this.currentCaretPosition > currentPageElHeight) {
            
            if(currentEditableElLastChild.offsetHeight + currentEditableElLastChild.offsetTop > currentPageElHeight && currentEditableElLastChild.offsetTop < currentPageElHeight) {
              
              const currentPageItem = currentEditableElLastChild.innerHTML.split(" ")
              const lastEditableModifiedText = currentPageItem.pop()
              nextPageItem.unshift(lastEditableModifiedText)
              
              currentEditableElLastChild.innerHTML = currentPageItem.join(" ")

              const nextPageText = nextPageItem.join("")
              
              if(nextEditableElfirstChild.innerHTML === "<br>" && nextEditableEl.childElementCount === 1) {
                const div = document.createElement("div");
                const textNode = document.createTextNode(nextPageText);
                console.log("next",nextPageText)
                div.appendChild(textNode)
                nextEditableEl.replaceChild(div, nextEditableElfirstChild)
              } else {
                const div = document.createElement("div");
                const textNode = document.createTextNode(nextPageText + nextEditableElfirstChild.innerText);
                div.appendChild(textNode)
                nextEditableEl.insertBefore(div, nextEditableElfirstChild)
                nextEditableEl.removeChild(nextEditableElfirstChild)
              }
              
              return this.moveFocus(textNode, nextPageText.length)
            }

            if(nextEditableElfirstChild.innerHTML === "<br>" && nextEditableEl.childElementCount === 1) {
              nextEditableEl.replaceChild(currentEditableElLastChild, nextEditableElfirstChild)
              // console.log("asda",nextEditableEl.lastChild.offsetTop)
              
            } else {
              nextEditableEl.insertBefore(currentEditableElLastChild, nextEditableElfirstChild)
              // console.log("asdaqswdawd",nextEditableEl.lastChild.offsetTop+nextEditableEl.lastChild.clientHeight)
              
              //pipeline logic
              
              if(nextEditableEl.lastElementChild.offsetTop+nextEditableEl.lastElementChild.clientHeight > nextEditableEl.clientHeight){
               console.log("entered from end,space not found")
               console.log("pipeline logic,when moved from end")

               currentPageEl=document.getElementById(`editable_${this.props.page.next_page}`)
               currentEditableElId=`editable_${this.props.page.next_page}`
               nextEditableElId=`editable_u16c`;
               nextEditableEl=document.getElementById(nextEditableElId)

               this.moveFocus(nextEditableEl.lastElementChild,1)
               selection=window.getSelection()
               if(selection.anchorNode.offsetTop === undefined) {
                  this.currentCaretPosition = selection.anchorNode.parentNode ? selection.anchorNode.parentNode.offsetTop + selection.anchorNode.parentNode.offsetHeight: 0
                } else {
                  this.currentCaretPosition = selection.anchorNode ? selection.anchorNode.offsetTop + selection.anchorNode.offsetHeight: 0
                }

              }else{
               //break loop
               this.moveFocus(enteredTriggeredLast,0)
               spaceFound=true
              }
              
            } 
           nextEditableEl.focus()

          } else {
            console.log("Move content to the next page")
            nextEditableEl.insertBefore(currentEditableElLastChild, nextEditableElfirstChild)
            //pipeline logic
             console.log("Move",nextEditableEl.lastElementChild.offsetTop+nextEditableEl.lastElementChild.clientHeight > nextEditableEl.clientHeight )
            //  console.log("pipeline logic")
             if(nextEditableEl.lastElementChild.offsetTop+nextEditableEl.lastElementChild.clientHeight > nextEditableEl.clientHeight){
               console.log("pipeline logic when moved from between")
               console.log("entered from between,space not found")
               currentPageEl=document.getElementById(`editable_${this.props.page.next_page}`)
               currentEditableElId=`editable_${this.props.page.next_page}`
               nextEditableElId=`editable_u16c`;
               nextEditableEl=document.getElementById(nextEditableElId)

               this.moveFocus(nextEditableEl.lastElementChild,1)
               selection=window.getSelection()
               if(selection.anchorNode.offsetTop === undefined) {
                  this.currentCaretPosition = selection.anchorNode.parentNode ? selection.anchorNode.parentNode.offsetTop + selection.anchorNode.parentNode.offsetHeight: 0
                } else {
                  this.currentCaretPosition = selection.anchorNode ? selection.anchorNode.offsetTop + selection.anchorNode.offsetHeight: 0
                }

               
             }else{
               //break loop
              //  console.log("asasfzsf",enteredTriggeredLoc)
               this.moveFocus(enteredTriggeredLoc,0)
               spaceFound=true
               
             }
          }
          //     const El = document.getElementById(nextEditableElId);
          //     console.log("next id",nextEditableElId)
          //     console.log("el",El)
          // // console.log("FULL LENGTH",nextEditableEl.lastChild.clientHeight+nextEditableEl.lastChild.offsetTop,El.clientHeight)
          // if(nextEditableEl.lastChild.clientHeight+nextEditableEl.lastChild.offsetTop>El.clientHeight){
          //   console.log("exceeded");
          //   currentEditableElId=`editable_${this.props.page.next_page}`;
          //   nextEditableElId=`editable_u16c`;
          //   currentPageEl=document.getElementById(`editable_${this.props.page.next_page}`)
          //   nextEditableEl=document.getElementById(nextEditableElId)

          // }else{
          //   console.log("not exceeded");
          //   spaceFound=true;
          //   console.log("breaked");
          // }
        // }
        }else{
          spaceFound=true;
        }
        
      // }
      i++;
      }//while end
      
      // this.moveFocus(enteredTriggeredLoc,enteredTriggeredLoc.length)

    }

    this.previousCaretPosition = this.currentCaretPosition
    
  
    
  }

  render() {
    const { tagName ='div', html = "", innerRef, page, style, ...props } = this.props;

    return React.createElement(
      tagName,
      {
        ...props,
        ref: typeof innerRef === 'function' ? (current) => {
          innerRef(current)
          this.el.current = current
        } : innerRef || this.el,
        onClick: this.emitKeyup,
        onInput: this.emitKeyup,
        onKeyDown: this.emitKeyup,
        contentEditable: !this.props.disabled,
        dangerouslySetInnerHTML: { __html: html },
        style
      },
    this.props.children);
  }
}