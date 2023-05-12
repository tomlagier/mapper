import { BlurFilter, TextStyle } from 'pixi.js'
import { Stage, Container, Sprite, Text } from '@pixi/react'
import { useMemo } from 'react'
import bunny from '../assets/bunny.png'

export function PixiCanvas() {
  return (
    <Stage>
      <Sprite image={bunny} x={400} y={500} anchor={{ x: 0.5, y: 0.5 }} />

      <Container x={400} y={330}>
        <Text
          text="Hello World"
          anchor={{ x: 0.5, y: 0.5 }}
          style={{ fill: '0xffffff' } as TextStyle}
        />
      </Container>
    </Stage>
  )
}
