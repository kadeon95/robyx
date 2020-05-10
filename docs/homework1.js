"use strict";

var HW1 = function() {
var canvas;
var gl;
var program;


var numPositions = 84;

//                                                                              ARRAY OF VERTICES AND ATTRIBUTES.
var positionsArray = [];
var normalsArray = [];
var texCoordsArray = [];

//Parameters for the perspective view
var  near = 0.01;
var  far = 30.0;
var  fovy = 20.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect=1.0;       // Viewport aspect ratio


// Parameters of the light and material properties. As specified in the Cartoon Shader.

// Global ambient component of the global light.
var globalAmbient = vec4(0.3,0.3,0.3,1);

// Parameters of the directional light.
// Direction, Ambient and diffuse components.
var lightDirection = vec4(0, 0, 1, 0.0);
var lightAmbient   = vec4(0.3, 0.3, 0.3, 1.0);// Grayscale
var lightDiffuse   = vec4(0.3, 0.3, 0.3, 1.0);

// Parameters of the spotlight. Position, Direction, Ambient and Diffuse. Also
var spotlightPosition  = vec4(0,     0, 1.0, 1.0);
var spotlightDirection = vec4(0,     0,  -1,   0);
var spotlightAmbient = vec4(0.3, 0.3, 0.3, 1.0); // Grayscale
var spotlightDiffuse = vec4(0.3, 0.3, 0.3, 1.0);
var spotlight_limit= 0.01;

// Parameters of the material. 
var materialAmbient = vec4(0.3, 0.3, 0.3, 1.0);  // Grayscale
var materialDiffuse = vec4(0.3, 0.3, 0.3, 1.0);

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var nMatrix, nMatrixLoc;

// Parameters for the lookAt function.
var radius = 7.0;
var theta = 1.39; //  So that at the beginning the tree is clearly visible.
var phi = -90.0* Math.PI/180.0;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

// Constants used in order to build the geometry of the tree.
var base_foliage = 0.6;
var cap = 0.90;
var middle_foliage_height = 0.30;
var upper_foliage_height = 0.60;

var torso = 0.1;
var middle_foliage = 0.4;
var middle_foliage_cap_offset=0.10;
var upper_foliage_cap_offset=0.10;
var upper_foliage = 0.2;
var base_foliage_up = 0.2;
var middle_foliage_up = 0.1;

var ba=8;
var bb=9;
var bc=10;
var bd=11;

var ma=12;
var mb=13;
var mc=14;
var md=15;



var ua=16;
var ub=17;
var uc=18;
var ud=19;
var ucap=20;

var torso_b_a = 0;
var torso_b_b = 1;
var torso_b_c = 2;
var torso_b_d = 3;
var torso_u_a = 4;
var torso_u_b = 5;
var torso_u_c = 6;
var torso_u_d = 7;
var z_offset=0.3;



var lower_cap =  21;
var middle_cap = 22;

// Flag used in order to remove and apply again the texture.
var lflag=true;
var texture, texture2;


//                                                                                      ARRAY OF VERTICES
var vertices = [
	vec4(-torso,    0,   -0.5+z_offset,1.0),  //torso ba
	vec4(0,    -torso,   -0.5+z_offset,1.0),    // torso bb
	vec4(torso,     0,   -0.5+z_offset,1.0),       // torso bc
	vec4(0.0,   torso,   -0.5+z_offset,1.0),     // torso bd // lower torso 3
	vec4(-torso,    0,     0+z_offset,1.0),
	vec4(0,    -torso,     0+z_offset,1.0),
	vec4(torso,     0,     0+z_offset,1.0),
	vec4(0.0,   torso,     0+z_offset,1.0), //upper torso 7
	vec4(-base_foliage, 0,  0+z_offset,1.0),
	vec4(0,  -base_foliage,  0+z_offset,1.0),
	vec4(base_foliage,  0,  0+z_offset,1.0),
	vec4(0.0, base_foliage,  0+z_offset,1.0), //lower chioma 11
	vec4(-middle_foliage, 0,  middle_foliage_height+z_offset,1.0),
	vec4(0,  -middle_foliage,  middle_foliage_height+z_offset,1.0),
	vec4(middle_foliage,  0,  middle_foliage_height+z_offset,1.0),
	vec4(0.0, middle_foliage,  middle_foliage_height+z_offset,1.0), //middle chioma 15
	vec4(-upper_foliage, 0,  upper_foliage_height+z_offset,1.0),
	vec4(0,  -upper_foliage,  upper_foliage_height+z_offset,1.0),
	vec4(upper_foliage,  0,  upper_foliage_height+z_offset,1.0),
	vec4(0.0, upper_foliage,  upper_foliage_height+z_offset,1.0), //upper chioma 19
	vec4(0.0, 0.0,  cap+z_offset,1.0), // higher_puntale 20
	vec4(0.0, 0.0,  middle_foliage_height+0.1+z_offset,1.0), //lower_puntale 21
	vec4(0.0, 0.0,  upper_foliage_height+0.1+z_offset,1.0) //middle_puntale	22
];


// Coordinates for the texture of the triangular foliage
var texCoordTriangle = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(0.5, 1)
    ];
    
// Coordinates for the texture of the quadrilateral foliage and the 

var texCoord = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 8),
    vec2(1, 8)
];

var texCoordFoliage = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(1, 1)
];


// Function used for building the tronco and quadrilateral foliage
function quad(a, b, c, d, torso) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[a]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

	if ( torso ){
		positionsArray.push(vertices[a]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[0]);

		positionsArray.push(vertices[b]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[1]);

		positionsArray.push(vertices[d]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[3]);

		positionsArray.push(vertices[b]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[1]);

		positionsArray.push(vertices[c]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[2]);

		positionsArray.push(vertices[d]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoord[3]);
	}
		else
	{
		positionsArray.push(vertices[a]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[0]);

		positionsArray.push(vertices[b]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[1]);

		positionsArray.push(vertices[d]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[3]);

		positionsArray.push(vertices[b]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[1]);

		positionsArray.push(vertices[c]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[2]);

		positionsArray.push(vertices[d]);
		normalsArray.push(normal);
		texCoordsArray.push(texCoordFoliage[3]);
	}
}


// Function used for building a single foliage ( they are 3 in total )
function cap_foliage(a, b, c, d, e) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[e], vertices[a]);
     var normal_face_1 = cross(t1, t2);
     normal_face_1 = vec3(normal_face_1);
     
     var t1 = subtract(vertices[a], vertices[d]);
     var t2 = subtract(vertices[e], vertices[d]);
     var normal_face_2 = cross(t1, t2);
     normal_face_2 = vec3(normal_face_2);
     
     var t1 = subtract(vertices[d], vertices[c]);
     var t2 = subtract(vertices[e], vertices[c]);
     var normal_face_3 = cross(t1, t2);
     normal_face_3 = vec3(normal_face_3);
     
     var t1 = subtract(vertices[c], vertices[b]);
     var t2 = subtract(vertices[e], vertices[b]);
     var normal_face_4 = cross(t1, t2);
     normal_face_4 = vec3(normal_face_4);



     positionsArray.push(vertices[a]);
     normalsArray.push(normal_face_1);
     texCoordsArray.push(texCoordTriangle[0]);

     positionsArray.push(vertices[b]);
     normalsArray.push(normal_face_1);
     texCoordsArray.push(texCoordTriangle[1]);

     positionsArray.push(vertices[e]);
     normalsArray.push(normal_face_1);
     texCoordsArray.push(texCoordTriangle[2]);

     positionsArray.push(vertices[a]);
     normalsArray.push(normal_face_2);
     texCoordsArray.push(texCoordTriangle[0]);

     positionsArray.push(vertices[d]);
     normalsArray.push(normal_face_2);
     texCoordsArray.push(texCoordTriangle[1]);

     positionsArray.push(vertices[e]);
     normalsArray.push(normal_face_2);     
     texCoordsArray.push(texCoordTriangle[2]);

     positionsArray.push(vertices[d]);
     normalsArray.push(normal_face_3);
     texCoordsArray.push(texCoordTriangle[0]);

     positionsArray.push(vertices[c]);
     normalsArray.push(normal_face_3);
     texCoordsArray.push(texCoordTriangle[1]);

     positionsArray.push(vertices[e]);
     normalsArray.push(normal_face_3);     
     texCoordsArray.push(texCoordTriangle[2]);

     positionsArray.push(vertices[c]);
     normalsArray.push(normal_face_4);
     texCoordsArray.push(texCoordTriangle[0]);

     positionsArray.push(vertices[b]);
     normalsArray.push(normal_face_4);
     texCoordsArray.push(texCoordTriangle[1]);

     positionsArray.push(vertices[e]);
     normalsArray.push(normal_face_4);
     texCoordsArray.push(texCoordTriangle[2]);

  // 12 fin qua, poi chiamo quad ---> +6 = 18 vertici ok
     quad(a,b,c,d, false); // base 
}


function build_foliage()  // 18*3 = 54  vertices
{
    cap_foliage(ba, bb, bc, bd, lower_cap);    //18
    cap_foliage(ma, mb, mc, md, middle_cap); //18
    cap_foliage(ua, ub, uc, ud, ucap); // 18
}



function build_torso_(b_a, b_b ,b_c ,b_d ,u_a ,u_b ,u_c ,u_d)  //30 vertices for torso
{
    quad(b_a, b_b, u_b, u_a,true);
    quad(b_b, b_c, u_c, u_b,true);
    quad(b_c, b_d, u_d, u_c,true);
    quad(b_d, b_a, u_a, u_d,true);
    quad(b_a, b_b, b_c, b_d,false);

}

	
function build_torso()
{
	build_torso_(torso_b_a, torso_b_b, torso_b_c, torso_b_d, torso_u_a, torso_u_b, torso_u_c, torso_u_d);
} 
	
function build_tree()  // 84 vertices in total
{ 
	build_foliage();
	build_torso();
}


// Two different functions: one for each texture. Of course I did it in this way because this is a small project.

function configureTexture2( image ) {
    texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

	// Compute uniform products
	var globalAmbientProduct = mult(globalAmbient, materialAmbient);
    var directionalAmbientProduct = mult(lightAmbient, materialAmbient);
    var directionalDiffuseProduct = mult(lightDiffuse, materialDiffuse);
    
    var spotlightAmbientProduct = mult(spotlightAmbient, materialAmbient);
    var spotlightDiffuseProduct = mult(spotlightDiffuse, materialDiffuse);


	build_tree();
	
	// NORMALS ARRAY
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

	// POSITIONS ARRAY
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // TEXTURE ATTRIBUTE
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);
    

	// Button for enable and disable the texture
    document.getElementById("ButtonL").onclick = function(){
      lflag = !lflag;
      gl.uniform1f(gl.getUniformLocation(program,
         "uLflag"), lflag);
    };
    
	// INITIALIZE THE TEXTURE. IN THIS CASE WE TAKE IT FROM THE HTML FILE.
    var image = document.getElementById("texImageFoliage");

    configureTexture(image);
    
    image = document.getElementById("texImage");

    configureTexture2(image);
    
    
    gl.uniform1f(gl.getUniformLocation(program,
         "uLflag"), lflag);
         
    document.getElementById("ButtonL").onclick = function(){
      lflag = !lflag;
      gl.uniform1f(gl.getUniformLocation(program,
         "uLflag"), lflag);
    };
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    document.getElementById("zFarSlider").onchange = function(event) {
        far = event.target.value;
    };
    document.getElementById("zNearSlider").onchange = function(event) {
        near = parseFloat(event.target.value);
    };
    document.getElementById("radiusSlider").onchange = function(event) {
       radius = parseFloat(event.target.value);
    };
    document.getElementById("thetaSlider").onchange = function(event) {
        theta = parseFloat(event.target.value)* Math.PI/180.0;
    };
    document.getElementById("phiSlider").onchange = function(event) {
        phi = parseFloat(event.target.value)* Math.PI/180.0;
    };
    document.getElementById("aspectSlider").onchange = function(event) {
        aspect = parseFloat(event.target.value);
    };
    document.getElementById("fovSlider").onchange = function(event) {
        fovy = parseFloat(event.target.value);
    };
    

    
    // DIRECTIONAL LIGHT PARAMETERS
    document.getElementById("lightDirectionX").onchange = function(event) {
        lightDirection[0] = parseFloat(event.target.value);
    };
    document.getElementById("lightDirectionY").onchange = function(event) {
        lightDirection[1] = parseFloat(event.target.value);
    };
    document.getElementById("lightDirectionZ").onchange = function(event) {
        lightDirection[2] = parseFloat(event.target.value);
    };
      
      

    // SPOTLIGHT LIGHT PARAMETERS
    document.getElementById("spotlightPositionX").onchange = function(event) {
        spotlightPosition[0] = parseFloat(event.target.value);
    };
    document.getElementById("spotlightPositionY").onchange = function(event) {
        spotlightPosition[1] = parseFloat(event.target.value);
    };
    document.getElementById("spotlightPositionZ").onchange = function(event) {
        spotlightPosition[2] = parseFloat(event.target.value);
    };
    

    document.getElementById("spotlightDirectionX").onchange = function(event) {
        spotlightDirection[0] = parseFloat(event.target.value);
    };
    document.getElementById("spotlightDirectionY").onchange = function(event) {
        spotlightDirection[1] = parseFloat(event.target.value);
    };
    document.getElementById("spotlightDirectionZ").onchange = function(event) {
        spotlightDirection[2] = parseFloat(event.target.value);
    };

    // DIRECTIONAL LIGHT PRODUCTS TO SHADERS
    gl.uniform4fv( gl.getUniformLocation(program,
       "uDirectionalAmbientProduct"),flatten(directionalAmbientProduct));
     
    gl.uniform4fv( gl.getUniformLocation(program,
       "uDirectionalDiffuseProduct"),flatten(directionalDiffuseProduct));


    // SPOTLIGHT PRODUCTS TO SHADERS
    gl.uniform4fv( gl.getUniformLocation(program,
       "uSpotlightAmbientProduct"),flatten(spotlightAmbientProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
       "uSpotlightDiffuseProduct"),flatten(spotlightDiffuseProduct));    
    document.getElementById("spotlightLimit").onchange = function(event) {
        spotlight_limit = event.target.value;
    };
           
    // Global light product
    gl.uniform4fv( gl.getUniformLocation(program,
       "uGlobalAmbientProduct"),flatten(globalAmbientProduct));

    render();
}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    nMatrix = normalMatrix(modelViewMatrix, true);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix)  );
    gl.uniform4fv(gl.getUniformLocation(program, "uLightDirection"), lightDirection);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpotlightPosition"), spotlightPosition);
    
    gl.uniform4fv( gl.getUniformLocation(program,
       "u_Direction_spotlight"),flatten(spotlightDirection));
    gl.uniform1f( gl.getUniformLocation(program,
       "u_spotlight_limit"),Math.cos(spotlight_limit));   
          
	// Bind foliage texture
    gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.drawArrays(gl.TRIANGLES,0,numPositions-30);

	// Bind torso texture
    gl.bindTexture(gl.TEXTURE_2D, texture2);


	gl.drawArrays(gl.TRIANGLES,numPositions-30,30);

    requestAnimationFrame(render);
}

}

HW1();
