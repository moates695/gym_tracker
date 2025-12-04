import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useSetAtom } from 'jotai';
import { addCaughtErrorLogAtom, addErrorLogAtom } from '@/store/actions';

export type Point3D = { x: number; y: number; z: number };

interface ThreeAxisGraphProps {
  points: Point3D[]
}

export default function ThreeAxisGraph(props: ThreeAxisGraphProps) {
  const { points } = props;
  
  // const rotationRef = useRef({ x: 0, y: 0 });
  
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const normMax = 100;
  const rotationPoint = normMax / 2;
  const rotationRef = useRef({ x: rotationPoint, y: rotationPoint });

  const getMinMax = (points: Point3D[]) => {
    try {
      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const zs = points.map(p => p.z);

      return {
        x: { min: Math.min(...xs), max: Math.max(...xs) },
        y: { min: Math.min(...ys), max: Math.max(...ys) },
        z: { min: Math.min(...zs), max: Math.max(...zs) }
      };
    } catch (error) {
      addCaughtErrorLog(error, 'error getMinMax');
      return {
        x: { min: 0, max: 1 },
        y: { min: 0, max: 1 },
        z: { min: 0, max: 1 }
      };
    }
  };

  const normalizePoints = (points: Point3D[]): Point3D[] => {
    try {
      const { x, y, z } = getMinMax(points);

      const normalize = (val: number, min: number, max: number) =>
        max === min ? 0 : ((val - min) / (max - min)) * normMax;

      return points.map(p => ({
        x: normalize(p.x, x.min, x.max),
        y: normalize(p.y, y.min, y.max),
        z: normalize(p.z, z.min, z.max)
      }));
    } catch (error) {
      addCaughtErrorLog(error, 'error normalizePoints');
      return [];
    }
  };

  const normalizedPoints = normalizePoints(points);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      rotationRef.current.x += gestureState.dy * 0.0005;
      rotationRef.current.y += gestureState.dx * 0.0005;
    },
  });

  const onContextCreate = async (gl: any) => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
    const cameraPosition = normMax * 1.5;
    camera.position.set(cameraPosition, cameraPosition, cameraPosition);
    camera.lookAt(0, 0, 0);
    
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    
    // Create axes
    const axesHelper = new THREE.AxesHelper(normMax * 1.25);
    scene.add(axesHelper);
    
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
      const time = Date.now() * 0.0001;
      pointMeshes.forEach((mesh: any, index: any) => {
        const hue = (time + index * 0.5) % 1;
        mesh.material.color.setHSL(hue, 0.8, 0.6);
      });
      
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
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