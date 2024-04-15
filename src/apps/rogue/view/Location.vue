<template>
  <div
    :style="locationStyle(location)"
    class="location"
    :class="locationClasses(location)"
    v-html="locationContent(location)"
  />
</template>
<script>
const LOCATION = {
  WIDTH: 12,
  HEIGHT: 21
}
export default {
  name: 'GameLocation',
  props: {
    location: { type: Object, required: true }
  },
  data() {
    return {
      locationWidth: LOCATION.WIDTH + 'px',
      locationHeight: LOCATION.HEIGHT + 'px'
    }
  },
  computed: {
    isVisible() {
      const location = this.location
      return location.visible ||
        (
          location.mapped &&
          (
            location.room?.lit ||
            location.item?.type === 'staircase'
          )
        )
    }
  },
  methods: {
    locationClasses(location) {
      const classes = {}
      if (location.item?.type === 'staircase' && !location.character) {
        classes.flashing = true
      }
      return classes
    },
    locationContent(location) {
      if (!this.isVisible) {
        return ''
      }
      if (location.character) {
        return '&#x263A;'
      }
      if (location.mapped && location.item?.type === 'staircase') {
        return '&#x2630;'
      }
      if (location.item && location.visible) {
        switch (location.item.type) {
          case 'stick':
            return '&#x03C4;'
          case 'scroll':
            return '&#x266A;'
          case 'potion':
            return '&#x0021;'
          case 'weapon':
            return '&#x2191;'
          case 'ring':
            return '&#x25CB;'
          case 'gold':
            return '&#x263C;'
          case 'staircase':
            return '&#x2630;'
        }
      }
      switch (location.type) {
        case 'hallway':
          return ''
        case 'floor':
          return '&#8231;'
        case 'upLeftWall':
          return '&#x255D;'
        case 'upRightWall':
          return '&#x255A;'
        case 'downLeftWall':
          return '&#x2557;'
        case 'downRightWall':
          return '&#x2554;'
        case 'horizontalWall':
          return '&#x2550;'
        case 'verticalWall':
          return '&#x2551;'
        case 'door':
          return '&#x256C;'
        default:
          return ''
      }
    },
    getBackgroundColor(location) {
      if (!this.isVisible) {
        return 'black'
      }
      if (location.character) {
        if (location.type === 'hallway') {
          return '#b3b3b3'
        }
        return 'black'
      }
      if (location.item) {
        switch (location.item.type) {
          case 'staircase': {
            return 'lightgreen'
          }
        }
      }
      if (location.type === 'hallway') {
        return 'grey'
      }
      return ''
    },
    getColor(location) {
      if (location.character) {
        return 'yellow'
      }
      if (location.visible && location.item) {
        switch (location.item.type) {
          case 'ring':
          case 'weapon':
          case 'stick':
          case 'potion':
          case 'scroll':
            return '#5555ff'
          case 'gold':
            return '#ffff05'
          case 'staircase': {
            return 'black'
          }
        }
      }
      if (location.type === 'floor') return '#00ff34'
      if (location.type !== 'floor') return '#b74f00'
      return
    },
    locationStyle(location) {
      return {
        color: this.getColor(location),
        'background-color': this.getBackgroundColor(location),
        top: location.y * LOCATION.HEIGHT + 'px',
        left: location.x * LOCATION.WIDTH + 'px',
      }
    }
  }
}
</script>
<style scoped>
.location {
  width: v-bind(locationWidth);
  height: v-bind(locationHeight);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: v-bind(locationHeight);
}
@keyframes example {
  0%   {color: transparent;}
  49%  {color:transparent;}
  50% {color:black;}
  100% {color:black;}
}
.flashing {
  animation-name: example;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
</style>