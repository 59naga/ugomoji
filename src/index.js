import React from 'react'
import ReactDOM from 'react-dom'
import opentype from 'opentype.js'
import GIFEncoder from 'jsgif'

// quote by https://github.com/nodebox/opentype.js/blob/0.6.0/index.html#L138
// Round a value to the nearest "step".
const snap= (v,distance,strength)=>{
    return (v * (1.0 - strength)) + (strength * Math.round(v / distance) * distance)
}

class Container extends React.Component{
  componentDidMount(){
    const context= document.querySelector('canvas').getContext('2d')

    // opentype.load('eromangasimaji.otf',(error,font)=>{
    opentype.load('http://jsrun.it/assets/Q/3/m/i/Q3miw',(error,font)=>{
      if(error){
        throw error
      }
      this.font= font

      this.forceUpdate()
    })

    let encoder
    const tick= ()=>{
      if(this.font==null){
        setTimeout(tick,50)
        return
      }
      const width= window.innerWidth
      const height= window.innerHeight
      const text= this.refs.text.value.split(/\s/g)

      context.canvas.width= width
      context.canvas.height= height
      context.fillStyle= 'rgba(255,255,255,1)'
      context.fillRect(0,0,context.canvas.width,context.canvas.height)

      if(this.save && this.i===0){
        encoder= new GIFEncoder
        encoder.loopCount= 0
        encoder.delayTime= 1
        encoder.size= [width,height]
      }

      let fontSize= parseInt(this.refs.fontSize.value)
      let snapStrength= parseInt(this.refs.snapStrength.value)
      let snapDistanceThreshold= parseInt(this.refs.snapDistanceThreshold.value)

      let snapPath= null
      let snapDistance= 1 * (Math.random()*snapDistanceThreshold)
      let snapX= (Math.random()*10)
      let snapY= (Math.random()*10)
      let lineHeight= fontSize/4

      text.forEach((line,i)=>{
        const path= this.font.getPath(line,lineHeight,fontSize*(i+1),fontSize);
        path.fill= this.refs.color.value

        let strength= snapStrength / 100.0
        path.commands.forEach((command)=>{
          if(command.type!=='Z'){
            command.x= snap(command.x+snapX,snapDistance,strength) - snapX;
            command.y= snap(command.y+snapY,snapDistance,strength) - snapY;
          }
          if(command.type==='Q' || command.type==='C'){
            command.x1= snap(command.x1+snapX,snapDistance,strength) - snapX;
            command.y1= snap(command.y1+snapY,snapDistance,strength) - snapY;
          }
          if(command.type==='C'){
            command.x2= snap(command.x2+snapX,snapDistance,strength) - snapX;
            command.y2= snap(command.y2+snapY,snapDistance,strength) - snapY;
          }
        })
        path.draw(context);
      })

      if(this.save){
        if(this.i<10){
          this.i++
          encoder.addImage(context)
        }
        else{
          this.i= 0
          this.save= false

          encoder.encode().then((data)=>{
            const image= new Image
            image.src= 'data:image/gif;base64,'+btoa(data)
            document.body.appendChild(image)
          })
        }
      }

      setTimeout(tick,100)
    }
    requestAnimationFrame(()=>{tick()})
  }
  handleFile(event){
    const url= URL.createObjectURL(event.target.files[0])
    opentype.load(url,(error,font)=>{
      if(error){
        throw error
      }
      this.font= font
    })
  }

  render(){
    return (
      <div>
        <input type="file" onChange={::this.handleFile} />
        <div>
          <textarea
            ref="text"

            autoFocus
            defaultValue={
              'んぼぉぉ♥いぐ♡いぐ♥'+'\n'
              +'イッちゃうぅ♥SEX♥だめぇそこっ'+'\n'
              +'よわいのぉ♥Gスポばっかり'+'\n'
              +'コリコリするのはんそくぅ♡'
            }>
          </textarea>
          <input ref="color" type="color" defaultValue="#fc5370"/>
          <label>
            <input ref="fontSize" type="range" min="1" max="500" defaultValue="72" onChange={()=>{this.forceUpdate()}}/>
            {this.refs.fontSize? this.refs.fontSize.value: null}
          </label>
          <label>
            <input ref="snapStrength" type="range" min="1" max="100" defaultValue="30" onChange={()=>{this.forceUpdate()}}/>
            {this.refs.snapStrength? this.refs.snapStrength.value: null}
          </label>
          <label>
            <input ref="snapDistanceThreshold" type="range" min="1" max="100" defaultValue="30" onChange={()=>{this.forceUpdate()}}/>
            {this.refs.snapDistanceThreshold? this.refs.snapDistanceThreshold.value: null}
          </label>
          <button onClick={::this.handleSave}>アニメGifを生成</button>
        </div>
        <canvas />
      </div>
    )
  }
  handleSave(event){
    event.preventDefault()

    if(this.save){
      return
    }

    this.save= true
    this.i= 0
  }
}

window.addEventListener('DOMContentLoaded',()=>{
  ReactDOM.render(<Container/>,document.querySelector('main'))
})