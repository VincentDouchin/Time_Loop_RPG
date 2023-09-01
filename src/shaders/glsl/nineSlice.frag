varying vec2 vUv;
uniform vec2 size;
uniform vec2 new_size;
uniform sampler2D frame;
uniform float right;
uniform float top;
uniform float left;
uniform float bottom;
uniform float scale;

float map(float value, float originalMin, float originalMax, float newMin, float newMax) {
    return (value - originalMin) / (originalMax - originalMin) * (newMax - newMin) + newMin;
} 

float process_axis(float coord, float pixel, float texture_pixel, float start, float end) {
	if (coord > 1.0 - end * pixel) {
		return map(coord, 1.0 - end * pixel, 1.0, 1.0 - texture_pixel * end, 1.0);
	} else if (coord > start * pixel) {
		return map(coord, start * pixel, 1.0 - end * pixel, start * texture_pixel, 1.0 - end * texture_pixel);
	} else {
		return map(coord, 0.0, start * pixel, 0.0, start * texture_pixel);
	}
}

void main() {
	vec2 new_scale = new_size / size / scale;
	vec2 texture_pixel_size = 1.0 / size;
	vec2 pixel_size = texture_pixel_size / new_scale;
	
	vec2 mappedUV = vec2(
		process_axis(vUv.x, pixel_size.x, texture_pixel_size.x, left, right),
		process_axis(vUv.y, pixel_size.y, texture_pixel_size.y, top, bottom)
	);
	gl_FragColor = texture2D(frame, mappedUV);
}