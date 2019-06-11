import React, { Component } from "react";
import PropTypes from "prop-types";
import metadata from "./metadata";


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
  constructor(props){
    super(props);
    Object.values(metadata).map((element)=> element.pages.map((mapElement)=>this.allPages.push(mapElement)))
  }
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
  allPages=[]
  nextPageDetails=null
  currPageDetails=null
  bufferContent="";

 
  emitKeyup = (e) => {
    
   

    let currentEditableElId=`editable_${this.props.page.id}`;
    let nextEditableElId=`editable_${this.props.page.next_page}`;
    let nextPageId=this.props.page.next_page;
    let currentPageId=this.props.page.id;
    let currentPageEl=this.getEl();
   
    let nextEditableEl = document.getElementById(nextEditableElId)
    if (!currentPageEl) return;

    const selection = window.getSelection();
    
    if(selection.anchorNode.offsetTop === undefined) {
      this.currentCaretPosition = selection.anchorNode.parentNode ? selection.anchorNode.parentNode.offsetTop + selection.anchorNode.parentNode.offsetHeight: 0
    } else {
      this.currentCaretPosition = selection.anchorNode ? selection.anchorNode.offsetTop + selection.anchorNode.offsetHeight: 0
    }
    console.log(this.currentCaretPosition)
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
         console.log("enterede presssss",this.currentCaretPosition)
         e.preventDefault();
       }
    }

    
    if(this.currentCaretPosition !== this.previousCaretPosition ) {
      let i=0;
      let spaceFound = false;
      let selection = window.getSelection()
      let enteredTriggeredLoc=selection.anchorNode;
      let enteredTriggeredLast=nextEditableElfirstChild
      
      

      while (i<this.allPages.length && !spaceFound){
        console.log("while",i)
        console.log("currentPageId id",currentPageId)
        console.log("nextPageId id",nextPageId)
         console.log("currentPageEl",currentPageEl)
      const currentPageElHeight = currentPageEl.clientHeight

      // Current Editable reference
      const currentEditableEl = document.getElementById(currentEditableElId)
      let currentEditableElHeight = currentPageEl.lastChild ? currentPageEl.lastChild.offsetHeight + currentPageEl.lastChild.offsetTop: 0
      
      // if(this.props.page.next_page!==null){
        // Next Editable reference
        // const nextEditableEl = document.getElementById(nextEditableElId)
        // const nextEditableElHeight = nextEditableEl.clientHeight
        
        
        let currentPageItem = []
        let nextPageItem = []


        if(currentEditableElHeight > currentPageElHeight) {
          // while(i<10  && !spaceFound){
      
           const nextEditableElHeight = nextEditableEl.clientHeight
           console.log("greater")
          let currentEditableElLastChild = currentEditableEl.lastChild
          let nextEditableElfirstChild = nextEditableEl.firstChild
          

          if(this.currentCaretPosition > currentPageElHeight) {
            console.log("caret greater")
            
            if(currentEditableElLastChild.offsetHeight + currentEditableElLastChild.offsetTop > currentPageElHeight && currentEditableElLastChild.offsetTop < currentPageElHeight) {
              console.log("multiline")
              const currentPageItem = currentEditableElLastChild.innerHTML.split(" ")
              const lastEditableModifiedText = currentPageItem.pop()
              nextPageItem.unshift(lastEditableModifiedText)
              
              currentEditableElLastChild.innerHTML = currentPageItem.join(" ")

              const nextPageText = nextPageItem.join("")
              
              if(nextEditableElfirstChild.innerHTML === "<br>" && nextEditableEl.childElementCount === 1) {
                console.log("singl child")
                const div = document.createElement("div");
                const textNode = document.createTextNode(nextPageText);
                div.appendChild(textNode)
                nextEditableEl.replaceChild(div, nextEditableElfirstChild)
              } else {
                console.log("multiple child")
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
            } else {
              nextEditableEl && nextEditableEl.insertBefore(currentEditableElLastChild, nextEditableElfirstChild)
              //pipeline logic
              
              if(nextEditableEl.lastElementChild.offsetTop+nextEditableEl.lastElementChild.clientHeight > nextEditableEl.clientHeight){
               console.log("entered from end,space not found")
               console.log("pipeline logic,when moved from end")

              //  currentPageEl=document.getElementById(`editable_${this.props.page.next_page}`)
              //  currentEditableElId=`editable_${this.props.page.next_page}`

               this.currPageDetails=this.allPages.find((element)=>element.id===currentPageId)
                if(this.currPageDetails !=null){
                currentPageId=this.currPageDetails.next_page
               currentPageEl=document.getElementById(`editable_${this.currPageDetails.next_page}`)
               currentEditableElId=`editable_${this.currPageDetails.next_page}`
               console.log("this.currPageDetails",this.currPageDetails)
                }else{
                  console.log("this.currPageDetails is null")
                }


              //  nextEditableElId=`editable_u16c`;
              //  nextEditableEl=document.getElementById(nextEditableElId)
               console.log("nextPageId",nextPageId)
               this.nextPageDetails=this.allPages.find((element)=>element.id===nextPageId)
               console.log("this.nextPageDetails",this.nextPageDetails)
               if(this.nextPageDetails.next_page !== null){
                 
               nextEditableElId=`editable_${this.nextPageDetails.next_page}`
               nextPageId=this.nextPageDetails.next_page;
               nextEditableEl=document.getElementById(nextEditableElId)
               console.log("next details",nextEditableElId,currentPageEl)
               this.moveFocus(nextEditableEl.lastElementChild,1)
               selection=window.getSelection()
               if(selection.anchorNode.offsetTop === undefined) {
                  this.currentCaretPosition = selection.anchorNode.parentNode ? selection.anchorNode.parentNode.offsetTop + selection.anchorNode.parentNode.offsetHeight: 0
                } else {
                  this.currentCaretPosition = selection.anchorNode ? selection.anchorNode.offsetTop + selection.anchorNode.offsetHeight: 0
                }
               }else{
                 console.log("null next")
                 const lastpage=document.getElementById(`editable_${nextPageId}`)

                 this.bufferContent+=lastpage.lastElementChild.innerHTML

                lastpage.removeChild(lastpage.lastElementChild)
                 this.moveFocus(document.getElementById(`editable_${currentPageId}`).firstElementChild,0)
                 spaceFound=true
                 console.log(this.bufferContent)
               }

              //  this.moveFocus(nextEditableEl.lastElementChild,1)
              //  selection=window.getSelection()
              //  if(selection.anchorNode.offsetTop === undefined) {
              //     this.currentCaretPosition = selection.anchorNode.parentNode ? selection.anchorNode.parentNode.offsetTop + selection.anchorNode.parentNode.offsetHeight: 0
              //   } else {
              //     this.currentCaretPosition = selection.anchorNode ? selection.anchorNode.offsetTop + selection.anchorNode.offsetHeight: 0
              //   }

              }else{
               //break loop
               this.moveFocus(enteredTriggeredLast,0)
               spaceFound=true
              }
              
            } 
           nextEditableEl.focus()

          } else {
            console.log("Move content to the next page")
            nextEditableEl && nextEditableEl.insertBefore(currentEditableElLastChild, nextEditableElfirstChild)
            //pipeline logic
            console.log("nextEditableEl",nextEditableEl)
             console.log("Move",nextEditableEl.lastElementChild.offsetTop+nextEditableEl.lastElementChild.clientHeight > nextEditableEl.clientHeight )
            //  console.log("pipeline logic")
             if(nextEditableEl.lastElementChild.offsetTop+nextEditableEl.lastElementChild.clientHeight > nextEditableEl.clientHeight){
              //  pipeline logic when moved from between
              //  entered from between,space not found

                this.currPageDetails=this.allPages.find((element)=>element.id===currentPageId)
                if(this.currPageDetails !=null){
                currentPageId=this.currPageDetails.next_page
               currentPageEl=document.getElementById(`editable_${this.currPageDetails.next_page}`)
               currentEditableElId=`editable_${this.currPageDetails.next_page}`
               console.log("this.currPageDetails",this.currPageDetails)
                }else{
                  console.log("this.currPageDetails is null")
                }

                console.log("nextPageId",nextPageId)
               this.nextPageDetails=this.allPages.find((element)=>element.id===nextPageId)
               console.log("this.nextPageDetails",this.nextPageDetails)
               if(this.nextPageDetails.next_page !== null){
                 
               nextEditableElId=`editable_${this.nextPageDetails.next_page}`
               nextPageId=this.nextPageDetails.next_page;
               nextEditableEl=document.getElementById(nextEditableElId)
               console.log("next details",nextEditableElId,currentPageEl)
               this.moveFocus(nextEditableEl.lastElementChild,1)
               selection=window.getSelection()
               if(selection.anchorNode.offsetTop === undefined) {
                  this.currentCaretPosition = selection.anchorNode.parentNode ? selection.anchorNode.parentNode.offsetTop + selection.anchorNode.parentNode.offsetHeight: 0
                } else {
                  this.currentCaretPosition = selection.anchorNode ? selection.anchorNode.offsetTop + selection.anchorNode.offsetHeight: 0
                }
               }else{
                 console.log("null next")
                 const lastpage=document.getElementById(`editable_${nextPageId}`)

                 this.bufferContent+=" "+lastpage.lastElementChild.innerHTML

                lastpage.removeChild(lastpage.lastElementChild)
                 this.moveFocus(enteredTriggeredLoc,0)
                 spaceFound=true
                 console.log(this.bufferContent)
               }
               
             }else{
               //break loop
               this.moveFocus(enteredTriggeredLoc,0)
               spaceFound=true
               
             }
          }
        }else{
          spaceFound=true;
        }   
      // }

      i++;
      }//while end
    }
    this.previousCaretPosition = this.currentCaretPosition
  }

  render() {
    const { tagName ='div', html = "", innerRef, page, style, ...props } = this.props;
    
    console.log()
  //  console.log(allPages)
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
        dangerouslySetInnerHTML: { __html: this.props.page.prev_page===null ? `<span style='font-weight: normal; color:rgb(0, 0, 0); font-family:Montserrat; line-height: 14.4pt; font-size: 12pt; '>What is Lorem Ipsum?</span> <br />
  <span style='font-weight: normal; color:rgb(0, 0, 0); font-family:Montserrat; line-height: 14.4pt; font-size: 12pt; '>Lorem Ipsum is simply dummy text of the printing and 
    typesetting industry. Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type 
    specimen book. It has survived not only five centuries, but also the leap into </span> 
    <span style='font-weight: normal; color:rgb(0, 0, 0); font-family:Montserrat; line-height: 14.4pt; font-size: 12pt; '>electronic</span> 
    <span style='font-weight: normal; color:rgb(0, 0, 0); font-family:Montserrat; line-height: 14.4pt; font-size: 12pt; '> typesetting, remaining essentially unchanged. 
      It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including version</span> 
      <span style='font-weight: normal; color:rgb(0, 0, 0); font-family:Montserrat; line-height: 14.4pt; font-size: 12pt; '>s</span> 
      <span style='font-weight: normal; color:rgb(0, 0, 0); font-family:Montserrat; line-height: 14.4pt; font-size: 12pt; '> of Lorem Ipsum.</span> <br /><br /><br /><br />
      <span style='font-weight: normal; color:rgb(0, 0, 0); font-family:Montserrat; line-height: 14.4pt; font-size: 12pt; '>Why do we use it?</span> <br />
      <span style='font-weight: normal; color:rgb(0, 0, 0); font-family:Montserrat; line-height: 14.4pt; font-size: 12pt; '>It is a long established fact that a reader will be distracted by 
        the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using ‘Content here, content here’,
         making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for ‘lorem ipsum’ will uncover many web sites still in </span> <br /><br />
         <span style='font-weight: normal; color:rgb(0, 0, 0); font-family:Montserrat; line-height: 14.4pt; font-size: 12pt; '>their infancy. Various versions have evolved over the BMW</span> <br />
         <span style='font-weight: normal; color:rgb(0, 0, 0); font-family:Montserrat; line-height: 14.4pt; font-size: 12pt; '>bmw  years, sometimes by accident,sometimes on purpose bm   (injected humour and the like).</span> ` : html},
        style
      },
    this.props.children);
  }
}