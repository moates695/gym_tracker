import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

type Point = { x: number; y: number; z: number };

const ThreeDPlot = () => {
  // const rotationRef = useRef({ x: 0, y: 0 });
  
  const normMax = 100;
  const rotationPoint = normMax / 2;
  const rotationRef = useRef({ x: rotationPoint, y: rotationPoint });

  const points = [
    { x: 12, y: 30, z: 3 },
    { x: 12, y: 70, z: 2 },
    { x: 10, y: 72, z: 5 },
    { x: 8, y: 81, z: 3 },
    { x: 9, y: 78, z: 2 },
    { x: 12, y: 60, z: 1 },
    { x: 11, y: 75, z: 3 },
    { x: 10, y: 72, z: 3 }
  ];

  const getMinMax = (points: Point[]) => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const zs = points.map(p => p.z);

    return {
      x: { min: Math.min(...xs), max: Math.max(...xs) },
      y: { min: Math.min(...ys), max: Math.max(...ys) },
      z: { min: Math.min(...zs), max: Math.max(...zs) }
    };
  };

  const normalizePoints = (points: Point[]): Point[] => {
    const { x, y, z } = getMinMax(points);

    const normalize = (val: number, min: number, max: number) =>
      max === min ? 0 : ((val - min) / (max - min)) * normMax;

    return points.map(p => ({
      x: normalize(p.x, x.min, x.max),
      y: normalize(p.y, y.min, y.max),
      z: normalize(p.z, z.min, z.max)
    }));
  };

  const normalizedPoints = normalizePoints(points);
  normalizedPoints.push({ x: normMax, y: normMax, z: normMax })

  console.log(normalizedPoints)

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      rotationRef.current.x += gestureState.dy * 0.0005;
      rotationRef.current.y += gestureState.dx * 0.0005;
    },
  });

  const onContextCreate = async (gl: any) => {
    // Scene setup
    console.log("here44")
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
    const cameraPosition = normMax * 1.5;
    camera.position.set(cameraPosition, cameraPosition, cameraPosition);
    camera.lookAt(0, 0, 0);
    
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    
    // Create axes
    const axesHelper = new THREE.AxesHelper(normMax);
    scene.add(axesHelper);
    console.log("here55")

    // const createAxisMarkings = (axis: any, color: any) => {
    //   for (let i = 0; i <= 50; i += 5) {
    //     if (i === 0) continue;
        
    //     const geometry = new THREE.RingGeometry(0.5, 0.8, 8);
    //     const material = new THREE.MeshBasicMaterial({ color });
    //     const marker = new THREE.Mesh(geometry, material);
        
    //     if (axis === 'x') marker.position.set(i, 0, 0);
    //     else if (axis === 'y') marker.position.set(0, i, 0);
    //     else marker.position.set(0, 0, i);
        
    //     scene.add(marker);
    //   }
    // };

    // createAxisMarkings('x', 0xff0000); // Red for X
    // createAxisMarkings('y', 0x00ff00); // Green for Y  
    // createAxisMarkings('z', 0x0000ff); // Blue for Z
    
    // Create grid
    // const gridHelper = new THREE.GridHelper(6, 10, 0x444444, 0x444444);
    // scene.add(gridHelper);
    
    // Create point geometries and materials
    const pointGeometry = new THREE.SphereGeometry(1, 8, 8);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    
    // Add points to scene
    const pointMeshes: any = [];
    normalizedPoints.forEach(point => {
      const mesh = new THREE.Mesh(pointGeometry, pointMaterial);
      mesh.position.set(point.x, point.y, point.z);
      scene.add(mesh);
      pointMeshes.push(mesh);
    });
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Apply rotation from pan gestures
      // scene.rotation.x = rotationRef.current.x;
      scene.rotation.y = rotationRef.current.y;
      
      // Animate point colors
      const time = Date.now() * 0.0005;
      pointMeshes.forEach((mesh: any, index: any) => {
        const hue = (time + index * 0.5) % 1;
        mesh.material.color.setHSL(hue, 0.8, 0.6);
      });
      
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    console.log("here66")
    animate();
    console.log("here77")
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={onContextCreate}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  glView: {
    flex: 1,
  },
});

export default ThreeDPlot;