import { useEffect, useState } from 'react'

export function SavePreviews({ fills }) {
  return (
    <div style={{ position: 'absolute', top: 0, right: 0 }}>
      {Object.entries(fills).map(([id, fill]) => (
        <img key={id} src={fill.canvas} />
      ))}
    </div>
  )
}
