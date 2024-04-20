<script setup lang="ts">
  import { Location } from '../../../../../model/Location'
  import { Unit } from '../../../../../model/Unit'
  import { State } from '../../../../../model/State'
  import { computed } from 'vue'
  import { angle } from '../../../utils'

  interface Props {
    units: Array<Unit>
    state: State
    inside?: boolean
    startUnit?: Unit | undefined
    start?: Location | undefined
    end?: Location | undefined
    style?: Record<string, unknown>
  }

  // eslint-disable-next-line no-undef
  const props = withDefaults(defineProps<Props>(), {
    inside: false,
    startUnit: undefined,
    start: undefined,
    end: undefined,
    style: () => {
      return {}
    },
  })

  // eslint-disable-next-line vue/no-setup-props-destructure
  const W = props.state.game.width
  // eslint-disable-next-line vue/no-setup-props-destructure
  const H = props.state.game.height

  interface PathObject {
    radius: number
    angleOfView: number
    position: Location
    theta: number
    dxPos: boolean | null
  }

  const fogPaths = computed(() => {
    const out: string[] = []
    pathObjects.value.forEach((object) => {
      out.push(fogPath(object))
    })
    return out
  })

  const pathObjects = computed(() => {
    const out: PathObject[] = []
    props.units.forEach((u) => {
      const dxPos = null
      out.push({
        radius: u.data.vision,
        angleOfView: (u.data.angleOfView / 180) * Math.PI,
        position: u.data.position,
        theta: u.data.orientationMove + u.data.orientationGun,
        dxPos,
      })
    })
    if (props.startUnit && props.start && props.end) {
      const u = props.startUnit
      out.push({
        radius: u.data.vision,
        angleOfView: (u.data.angleOfView / 180) * Math.PI,
        position: props.start,
        theta: angle(props.start, props.end),
        dxPos: props.start.x < props.end.x,
      })
    }
    return out
  })

  function fogPath(u: PathObject): string {
    let out = ''
    const r = u.radius
    const angleOfView = u.angleOfView
    let theta = u.theta
    const pos = u.position
    const a = angleOfView / 2
    let iX = 1
    let iY = 1
    if (u.dxPos !== null) {
      if (u.dxPos) {
        theta = -theta
      } else {
        iX = -1
        iY = -1
      }
    }
    const A = new Location(
      pos.x + iX * r * Math.cos(theta + a),
      pos.y + iY * r * Math.sin(theta + a)
    )
    const B = new Location(
      pos.x + iX * r * Math.cos(theta - a),
      pos.y + iY * r * Math.sin(theta - a)
    )
    if (isNaN(A.x)) throw Error('problem!')
    if (isNaN(A.y)) throw Error('problem!')
    if (isNaN(B.x)) throw Error('problem!')
    if (isNaN(B.y)) throw Error('problem!')
    if (isNaN(W)) throw Error('problem!')
    if (props.inside) {
      out += 'M' + pos.x + ',' + pos.y
      out += ' L' + B.x + ',' + B.y
      out += ' A' + r + ',' + r + ' 0 0 1 ' + A.x + ',' + A.y
    } else {
      out += 'M' + A.x / W + ',' + A.y / H
      out += ' A' + r / W + ',' + r / H + ' 0 0 0 ' + B.x / W + ',' + B.y / H
      out += ' L' + B.x / W + ',0'
      out += ' L1,0'
      out += ' L1,1'
      out += ' L0,1'
      out += ' L0,0'
      out += ' L' + B.x / W + ',0'
      out += ' L' + B.x / W + ',' + B.y / H
      out += ' L' + pos.x / W + ',' + pos.y / H
    }
    out += ' Z'

    return out
  }
</script>

<template>
  <svg
    v-if="inside"
    class="fog"
    :width="state.game.width"
    :height="state.game.height"
    :viewBox="'0 0 ' + state.game.width + ' ' + state.game.height"
    style="background-color: transparent"
  >
    <path :d="fogPaths[0]" fill="transparent" :style="style" />
  </svg>
  <svg
    v-else
    class="fog"
    :width="state.game.width"
    :height="state.game.height"
    :viewBox="'0 0 ' + state.game.width + ' ' + state.game.height"
    style="background-color: transparent"
  >
    <clipPath
      v-for="(path, index) in fogPaths"
      :id="'myCurve' + index"
      :key="index"
      clipPathUnits="objectBoundingBox"
      :clip-path="index > 0 ? 'url(\'#myCurve' + (index - 1) + '\')' : ''"
    >
      <path :d="path" />
    </clipPath>
    <rect
      x="0"
      y="0"
      :width="state.game.width"
      :height="state.game.height"
      fill="rgba(0, 0, 0, 0.4)"
      :clip-path="'url(#myCurve' + (fogPaths.length - 1) + ')'"
    />
  </svg>
</template>

<style scoped>
  .fog {
    position: absolute;
    pointer-events: none;
    width: v-bind('props.state.game.width');
    height: v-bind('props.state.game.height');
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 7;
  }
</style>
