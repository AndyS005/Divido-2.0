import {View, Text, StyleSheet, TouchableOpacity, Image, BackHandler } from 'react-native'
import { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import TextRecognition from '@react-native-ml-kit/text-recognition'
import * as FileSystem from 'expo-file-system/legacy';


export default function ScanScreen({navigation, route}){

      useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
      return () => backHandler.remove()
      }, [])

    const {session, name, uid} = route.params
    const [image, setImage] = useState(null);

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted === false){
            alert('Camera permission is required');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, quality: 1,
        })
        if (!result.canceled){
            setImage(result.assets[0].uri)
        }
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true, quality: 1
        })
        if (!result.canceled){
            setImage(result.assets[0].uri);
        }

    }

    const BACKEND_URL = 'http://10.38.121.52:8000/extract-items'

    const getImageSize = (uri) => {
        return new Promise((resolve, reject) => {
            Image.getSize(uri, (width, height) => resolve({width, height}), reject)
        })
    }


    const processImage = async () => {
        if (!image){
            alert('Please take or upload photo first')
            return;
        }
        try{
            const result = await TextRecognition.recognize(image)

            const allLines = [];
            for (const block of result.blocks) {
            for (const line of block.lines) {
                allLines.push(line);
            }
            }
            allLines.sort((a, b) => a.frame.top - b.frame.top);

            const words = [];
            const boxes = [];

            for (const line of allLines) {
            const sortedElements = [...line.elements].sort((a, b) => a.frame.left - b.frame.left);
            for (const element of sortedElements) {
                words.push(element.text);
                boxes.push([
                element.frame.left,
                element.frame.top,
                element.frame.left + element.frame.width,
                element.frame.top + element.frame.height,
                ]);
            }
            }

            console.log("sorted words:", JSON.stringify(words));

            const {width, height} = await getImageSize(image)
            const imageBase64 = await FileSystem.readAsStringAsync(image, {encoding: FileSystem.EncodingType.Base64})

            const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                words: words,
                boxes: boxes,
                image_base64: imageBase64,
                image_width: width,
                image_height: height,
            }),
            })

            if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
            }

            const data = await response.json();
            console.log("backend data:", JSON.stringify(data));

            navigation.navigate('Items', {image:image, extractedData: data, session: session, name: name, uid:uid})
        } catch (error){
            console.log("processImage error:", error);
            alert('Couldnt process image. Please try again')
            return
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Scan your receipt</Text>
            <Text style={styles.subtitle}>Take a photo or upload from gallery</Text>
            <Text style={styles.subtitle}>💡 For best performance please crop only items and prices💡</Text>
            <Text style={styles.subtitle}> 💡 Exclude totals and subtotal if possible💡</Text>
            {image ? (
                <View style={{ width: '100%', gap: 12 }}>
                    <Image source={{uri:image}} style={{width: '100%', height: 400, borderRadius: 12}}/>
                    <TouchableOpacity onPress={processImage} style={styles.buttonPrimary}>
                        <Text style={styles.buttonText}>Confirm and Read</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setImage(null)} style={styles.buttonsecondary}>
                        <Text>Retake</Text>
                    </TouchableOpacity>
                </View>
            ):(
                <View style={{width: '100%', gap:12}}>
                    <TouchableOpacity onPress={takePhoto} style={styles.buttonPrimary}>
                        <Text style={styles.buttonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage} style={styles.buttonsecondary}>
                        <Text style={styles.buttonSeconText}>Upload from Gallery</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24
    },

    title: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
},

buttonPrimary: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },

  buttonsecondary: {
  borderWidth: 1,
  borderColor: '#1a1a2e',
  padding: 16,
  borderRadius: 12,
  width: '100%',
  alignItems: 'center',
  marginTop: 12,
},
buttonSeconText: {
  color: '#1a1a2e',
  fontSize: 16,
},

backButton: {
  position: 'absolute',
  top: 60,
  left: 24,
},
backText: {
  fontSize: 16,
  color: '#1a1a2e',
},

})