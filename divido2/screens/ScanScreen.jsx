import {View, Text, StyleSheet, TouchableOpacity, Image, BackHandler } from 'react-native'
import { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import TextRecognition from '@react-native-ml-kit/text-recognition'


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

    const processImage = async () => {
        if (!image){
            alert('Please take or upload photo first')
            return;
        }
        try{
            const result = await TextRecognition.recognize(image)
            const lines = result.blocks.flatMap(block => block.lines).map(line => line.text)
            navigation.navigate('Items', {image:image, rawText: lines, session: session, name: name, uid:uid})
        } catch (error){
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