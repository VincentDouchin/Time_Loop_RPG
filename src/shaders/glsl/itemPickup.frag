uniform vec4 color;
varying vec2 vUv;
uniform float radius;
void main() {
	float r = radius * 0.5;
	float sdfCircle = length(vUv-vec2(0.5))-r;
	vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
 	if (sdfCircle < 0.0) {
    	// Fragment is inside the circle, set color to white
    	color =  vec4(1.0, 1.0, 1.0, 1.0);
    } 
	gl_FragColor = color;
}