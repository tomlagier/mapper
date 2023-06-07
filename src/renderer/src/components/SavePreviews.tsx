import { Layer } from '@renderer/types/state'
import { useEffect, useState } from 'react'

interface SavePreviewsProps {
  layers: Record<string, Layer>
}

export function SavePreviews({ layers }: SavePreviewsProps) {
  return (
    <div style={{ position: 'absolute', top: 0, right: 0 }}>
      {Object.entries(layers).map(([id, layer]) => {
        if ('canvas' in layer) {
          return (
            <img
              key={id}
              id={id}
              data-layer={JSON.stringify({ brush: layer.brush })}
              src={layer.canvas}
            />
          )
        }

        return null
      })}
    </div>
  )
}
