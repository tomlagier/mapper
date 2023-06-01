export const frag = `
precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform sampler2D sample;
uniform float scale;

void main(void)
{
  vec4 sourcePixel = texture2D(uSampler, vTextureCoord);

  vec2 sampleCoords = fract(vTextureCoord * scale);
  vec4 samplePixel = texture2D(sample, sampleCoords);

  vec4 result = samplePixel.rgba * sourcePixel.r;

  gl_FragColor = result;
}
`
