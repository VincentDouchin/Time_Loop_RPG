uniform sampler2D tDiffuse;
uniform vec4 color;
varying vec2 vUv;
void main() {
	vec4 pixelColor = texture2D(tDiffuse, vUv);
	pixelColor *= color;
	gl_FragColor = pixelColor;
}