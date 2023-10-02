uniform sampler2D tDiffuse;
uniform vec4 color;
uniform bool additive;
varying vec2 vUv;
void main() {
	vec4 pixelColor = texture2D(tDiffuse, vUv);
	if (additive) {
		pixelColor += color;
	}else {
		pixelColor *= color;
	}
	gl_FragColor = pixelColor;
}