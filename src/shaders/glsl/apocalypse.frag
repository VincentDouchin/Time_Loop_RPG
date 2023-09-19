uniform sampler2D tDiffuse;
uniform vec4 color;
uniform float time;
varying vec2 vUv;

void main() {
   float randomOffsetX = sin(time*2.0) * 0.02;
    float randomOffsetY = cos(time*2.0) * 0.02;
    
    // Calculate the UV coordinates with distortion
    // vec2 distortedUV = vUv + vec2(randomOffsetX, randomOffsetY);
    
    vec2 noise = vUv + 0.08 * min(time,1.0) * cnoise(vec3(vUv.xy,time));
    
    
	    // Sample the original texture color
    vec4 originalColor = texture(tDiffuse, noise);
    
    // Define the target orange color
    vec4 orangeColor = vec4(1.0, 0.5, 0.0, 1.0); // Adjust the values to get the desired shade of orange
    
    // Interpolate between the original color and orange color based on time
    vec4 interpolatedColor = mix(originalColor, orangeColor, min(time,0.6));
    
    // Increase contrast by darkening blacks and whitening whites
    float contrast = mix(1.0, 2.0, time);// Adjust the contrast factor as needed
    vec3 adjustedColor = (vec3(interpolatedColor) - 0.5) * contrast + 0.5;
    
    // Combine the adjusted color with the alpha channel
    vec4 finalColor = vec4(adjustedColor, interpolatedColor.a);
    
    // Output the final color
    gl_FragColor = finalColor;

}