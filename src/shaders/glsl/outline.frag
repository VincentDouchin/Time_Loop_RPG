uniform sampler2D tDiffuse;
uniform vec4 color;
varying vec2 vUv;
uniform vec2 size;
void main() {
	float texelSizeX = 1. / size.x;
	float texelSizeY = 1. / size.y;
	float weight = (texture2D(tDiffuse, vec2(vUv.x + texelSizeX, vUv.y)).w +
		texture2D(tDiffuse, vec2(vUv.x, vUv.y - texelSizeY)).w +
		texture2D(tDiffuse, vec2(vUv.x - texelSizeX, vUv.y)).w +
		texture2D(tDiffuse, vec2(vUv.x, vUv.y + texelSizeY)).w);
	vec4 c = texture2D(tDiffuse, vUv);
	gl_FragColor = (c.w+c.x+c.y+c.z) > 0. ? c : ((weight > 0.) ? color : c);
}