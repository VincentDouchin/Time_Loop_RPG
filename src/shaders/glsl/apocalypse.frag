uniform sampler2D tDiffuse;
uniform vec4 color;
uniform float time;
varying vec2 vUv;

void main() {
   float randomOffsetX = sin(time*2.0) * 0.02;
    float randomOffsetY = cos(time*2.0) * 0.02;
    
    vec2 noise = vUv + 0.08 * min(time,1.0) * cnoise(vec3(0.2*vUv.x,10.0*vUv.y,time));
    
    vec2 mixed_noised = mix(vUv,noise,min(1.0,time)); 
    vec4 originalColor = texture(tDiffuse, mixed_noised);
    vec4 orangeColor = vec4(1.0, 0.4, 0.2, 1.0); 
    vec4 interpolatedColor = mix(originalColor, orangeColor, min(time,0.6));
    float contrast = mix(1.0, 3.0, time);// Adjust the contrast factor as needed
    vec3 adjustedColor = (vec3(interpolatedColor) - 0.5) * contrast + 0.5;
    vec4 finalColor = vec4(adjustedColor, interpolatedColor.a);
    
    // Output the final color
    gl_FragColor = mix(finalColor,vec4(0,0,0,1),min(time*0.8,1.0));

}