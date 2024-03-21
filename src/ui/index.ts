import FPS from './fps'
import Bag from './bag'
import Terrain from '../terrain'
import Block from '../terrain/mesh/block'
import Control from '../control'
import { Mode } from '../player'
import Joystick from './joystick'
import { isMobile } from '../utils'
import * as THREE from 'three'

export default class UI {
  constructor(terrain: Terrain, control: Control) {
    this.fps = new FPS()
    this.bag = new Bag()
    this.joystick = new Joystick(control)
    this.terrain = terrain
    this.control = control

    this.crossHair.className = 'cross-hair'
    this.crossHair.innerHTML = '+'
    document.body.appendChild(this.crossHair)

    // play
    this.play?.addEventListener('click', () => {
      if (this.play?.innerHTML === 'Play') {
        this.onPlay()

        // reset game
        terrain.noise.seed = Math.random()
        terrain.noise.stoneSeed = Math.random()
        terrain.noise.treeSeed = Math.random()
        terrain.noise.coalSeed = Math.random()
        terrain.noise.leafSeed = Math.random()
        terrain.customBlocks = []
        terrain.initBlocks()
        terrain.generate()
        terrain.camera.position.y = 40
        control.player.setMode(Mode.walking)
      }
      !isMobile && control.control.lock()
    })

    // save load
    this.save?.addEventListener('click', () => {
      if (this.save?.innerHTML === 'Save and Exit') {
        // save game
        const wwwCraftGameData = {
          block: terrain.customBlocks,
          seed: terrain.noise.seed,
          position: {
            x: terrain.camera.position.x,
            y: terrain.camera.position.y,
            z: terrain.camera.position.z
          }
        }
        const json = JSON.stringify(wwwCraftGameData)
        localStorage.setItem('wwwCraftGameData', json)

        // saving as file
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'index.wwwCraft.json'
        a.click()

        // ui update
        this.onExit()
        this.onSave()
      } else {
        // load game
        const wwwCraftGameData = JSON.parse(localStorage.getItem('wwwCraftGameData') || '{}')

        this.loadSave(wwwCraftGameData)
        
        // terrain.noise.seed = Number(wwwCraftGameData.seed) || Math.random()

        // const customBlocks = wwwCraftGameData.block || []
        // terrain.customBlocks = customBlocks
        // terrain.initBlocks()
        // terrain.generate()

        // const position = wwwCraftGameData.position as { x: number; y: number; z: number } ?? null
        // position && (terrain.camera.position.x = position.x)
        // position && (terrain.camera.position.y = position.y)
        // position && (terrain.camera.position.z = position.z)

        // // ui update
        // this.onPlay()
        // this.onLoad()
        // !isMobile && control.control.lock()
      }
    })

    // guide
    this.feature?.addEventListener('click', () => {
      this.features?.classList.remove('hidden')
    })
    this.back?.addEventListener('click', () => {
      this.features?.classList.add('hidden')
    })

    // setting
    this.setting?.addEventListener('click', () => {
      this.settings?.classList.remove('hidden')
    })
    this.settingBack?.addEventListener('click', () => {
      this.settings?.classList.add('hidden')
    })

    // render distance
    this.distanceInput?.addEventListener('input', (e: Event) => {
      if (this.distance && e.target instanceof HTMLInputElement) {
        this.distance.innerHTML = `Render Distance: ${e.target.value}`
      }
    })

    // fov
    this.fovInput?.addEventListener('input', (e: Event) => {
      if (this.fov && e.target instanceof HTMLInputElement) {
        this.fov.innerHTML = `Field of View: ${e.target.value}`
        control.camera.fov = parseInt(e.target.value)
        control.camera.updateProjectionMatrix()
      }
    })

    // music
    this.musicInput?.addEventListener('input', (e: Event) => {
      if (this.fov && e.target instanceof HTMLInputElement) {
        const disabled = e.target.value === '0'
        control.audio.disabled = disabled
        this.music!.innerHTML = `Music: ${disabled ? 'Off' : 'On'}`
      }
    })

    // apply settings
    this.settingBack?.addEventListener('click', () => {
      if (this.distanceInput instanceof HTMLInputElement) {
        terrain.distance = parseInt(this.distanceInput.value)
        terrain.maxCount =
          (terrain.distance * terrain.chunkSize * 2 + terrain.chunkSize) ** 2 +
          500

        terrain.initBlocks()
        terrain.generate()
        terrain.scene.fog = new THREE.Fog(
          0x87ceeb,
          1,
          terrain.distance * 24 + 24
        )
      }
    })

    // menu and fullscreen
    document.body.addEventListener('keydown', (e: KeyboardEvent) => {
      // menu
      if (e.key === 'e' && document.pointerLockElement) {
        !isMobile && control.control.unlock()
      }

      // fullscreen
      if (e.key === 'f') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          document.body.requestFullscreen()
        }
      }
    })

    // exit
    this.exit?.addEventListener('click', () => {
      this.onExit()
    })

    // play / pause handler
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement) {
        this.onPlay()
      } else {
        this.onPause()
      }
    })

    // disable context menu
    document.addEventListener('contextmenu', e => {
      e.preventDefault()
    })

    // fallback lock handler
    document.querySelector('canvas')?.addEventListener('click', (e: Event) => {
      e.preventDefault()
      !isMobile && control.control.lock()
    })
  }

  fps: FPS
  bag: Bag
  joystick: Joystick

  menu = document.querySelector('.menu')
  crossHair = document.createElement('div')

  // buttons
  play = document.querySelector('#play')
  control = document.querySelector('#control')
  setting = document.querySelector('#setting')
  feature = document.querySelector('#feature')
  back = document.querySelector('#back')
  exit = document.querySelector('#exit')
  save = document.querySelector('#save')

  // modals
  saveModal = document.querySelector('.save-modal')
  loadModal = document.querySelector('.load-modal')
  settings = document.querySelector('.settings')
  features = document.querySelector('.features')
  github = document.querySelector('.github')

  // settings
  distance = document.querySelector('#distance')
  distanceInput = document.querySelector('#distance-input')

  fov = document.querySelector('#fov')
  fovInput = document.querySelector('#fov-input')

  music = document.querySelector('#music')
  musicInput = document.querySelector('#music-input')

  settingBack = document.querySelector('#setting-back')


  linkDialog = () => {
    const form = document.querySelector('.create-link')
    const typeSelect = document.getElementById('link-type')
    const linkInput = document.getElementById('link')
    const targetInput = document.getElementById('target')
    const anchorInput = document.getElementById('anchor')

    const linkSubSet = form.querySelector('.create-link__link')
    const anchorSubSet = form.querySelector('.create-link__anchor')

    typeSelect.addEventListener('change', (e) => {
      if(typeSelect.value === 'anchor') {
        linkSubSet.classList.add('hidden')
        anchorSubSet.classList.remove('hidden')
      } else {
        linkSubSet.classList.remove('hidden')
        anchorSubSet.classList.add('hidden')
      }
    });
    
    return new Promise(resolve => {
      form?.classList.remove('hidden')
      // clear input
      linkInput?.setAttribute('value', '')
      targetInput?.setAttribute('value', '')
      anchorInput?.setAttribute('value', '')
      linkInput?.focus()

      form?.addEventListener('submit', (e) => {
        e.preventDefault()
        const attributes = [typeSelect?.value];
        if(typeSelect.value === 'link') {
          attributes.push(linkInput?.value)
          attributes.push(targetInput?.value)
        } else if(typeSelect.value === 'anchor') {
          attributes.push(anchorInput?.value)
        }
        form?.classList.add('hidden')
        resolve(attributes)
      }, {once:true})
    });
  }

  loadSave = (wwwCraftGameData) => {
    this.terrain.noise.seed = Number(wwwCraftGameData.seed) || Math.random()

    const customBlocks = wwwCraftGameData.block || []
    this.terrain.customBlocks = customBlocks
    this.terrain.initBlocks()
    this.terrain.generate()

    const position = wwwCraftGameData.position as { x: number; y: number; z: number } ?? null
    // check if we have url hash value
    if(document.location.hash !== '') {
      // if hash present search for diamond block of anchor type with same name
      const blocks = customBlocks.filter(b => b.attributes.length > 1 && b.attributes[0] === 'anchor' && b.attributes[1] === document.location.hash.replace('#',''));
      if(blocks.length > 0) {
        position.x = blocks[0].x
        position.y = blocks[0].y + 2
        position.z = blocks[0].z
      }
      
    }
  

    position && (this.terrain.camera.position.x = position.x)
    position && (this.terrain.camera.position.y = position.y)
    position && (this.terrain.camera.position.z = position.z)

    // ui update
    this.onPlay()
    this.onLoad()
    !isMobile && this.control.control.lock()
  }

  tryLoadIndexSave = async () => {
    // load /index.wwwCraft.json from server if exists
    const response = await fetch('/index.wwwCraft.json')
    if (response.ok) {
      const wwwCraftGameData = await response.json()
      this.loadSave(wwwCraftGameData)
    }
  }

  onPlay = () => {
    isMobile && this.joystick.init()
    this.menu?.classList.add('hidden')
    this.menu?.classList.remove('start')
    this.play && (this.play.innerHTML = 'Resume')
    this.crossHair.classList.remove('hidden')
    this.github && this.github.classList.add('hidden')
    this.feature?.classList.add('hidden')
  }

  onPause = () => {
    this.menu?.classList.remove('hidden')
    this.crossHair.classList.add('hidden')
    this.save && (this.save.innerHTML = 'Save and Exit')
    this.github && this.github.classList.remove('hidden')
  }

  onExit = () => {
    this.menu?.classList.add('start')
    this.play && (this.play.innerHTML = 'Play')
    this.save && (this.save.innerHTML = 'Load Game')
    this.feature?.classList.remove('hidden')
  }

  onSave = () => {
    this.saveModal?.classList.remove('hidden')
    setTimeout(() => {
      this.saveModal?.classList.add('show')
    })
    setTimeout(() => {
      this.saveModal?.classList.remove('show')
    }, 1000)

    setTimeout(() => {
      this.saveModal?.classList.add('hidden')
    }, 1350)
  }

  onLoad = () => {
    this.loadModal?.classList.remove('hidden')
    setTimeout(() => {
      this.loadModal?.classList.add('show')
    })
    setTimeout(() => {
      this.loadModal?.classList.remove('show')
    }, 1000)

    setTimeout(() => {
      this.loadModal?.classList.add('hidden')
    }, 1350)

  }

  update = () => {
    this.fps.update()
  }
}
