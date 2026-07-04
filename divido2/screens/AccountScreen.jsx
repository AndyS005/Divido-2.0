import { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, BackHandler} from 'react-native';
import { db } from '../firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { auth } from '../firebaseConfig'
import { signOut } from 'firebase/auth';

export default function AccountScreen({navigation, route}){

    const [sessions, setSessions] = useState([])
    const user = auth.currentUser

      useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
      return () => backHandler.remove()
      }, [])

    useEffect(() => {
    const loadHistory = async () => {
        if (!auth.currentUser) return;
        
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
        if (userDoc.exists()) {
        const sessionCodes = userDoc.data().sessions || []
        
        const sessionData = await Promise.all(
            sessionCodes.map(code => getDoc(doc(db, 'sessions', code)))
        )
        
        setSessions(sessionData
            .filter(snap => snap.exists())
            .map(snap => snap.data())
        )
        }
    }
    loadHistory()
    }, [])

const logout = async() => {
    await signOut(auth)
    navigation.navigate('Home')
}
    

    return(
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text>
                    ← back
                </Text>
            </TouchableOpacity>

            <Text style={styles.title}>account</Text>
            <Text style={styles.email}>{user?.displayName}</Text>
            <Text style={styles.subtitle}>{user?.email}</Text>

            <Text style={styles.sectionTitle}>Session history</Text>

            {sessions.length === 0? (
                <Text style={styles.empty}>no sessions yet</Text>
            ) : (
                <FlatList
                    data={sessions}
                    keyExtractor={item => item.code}
                    renderItem={({item}) => {
                        const userTotal = (item.items || []).reduce((sum, i) => {
                            if (i.claimedBy?.some(c => c.uid === auth.currentUser?.uid)){
                                return sum + (i.price / i.claimedBy.length)
                            } return sum
                        }, 0)


                        return (                            
                            <View style={styles.sessionRow}>
                                <View>
                                    <Text style={styles.sessionCode}>{item.code}</Text>
                                    <Text style={styles.sessionDate}>{item.createdAt?.toDate().toLocaleDateString()}</Text>
                                    <Text style={styles.sessionMembers}>{item.members?.map(m => m.name).join(', ')}</Text>
                                    <Text style={styles.sessionMembers}>your total: £{userTotal.toFixed(2)}</Text>
                                </View>
                            </View>

                        )
                }}
                />
            )}

            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                <Text>
                    log out
                </Text>
            </TouchableOpacity>

        </View>
    )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
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
  title: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 40,
    color: '#1a1a2e',
  },
  email: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  empty: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
  },
  list: {
    flex: 1,
  },
  sessionRow: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  sessionCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a2e',
    letterSpacing: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  sessionMembers: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#8B0000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    color: '#8B0000',
    fontSize: 16,
  },
});