import Card from '@/components/common/Card'; import { getAIInsights } from '@/services/aiService'; import { useState } from 'react'; import { View, Text } from 'react-native'; import Input from '@/components/common/Input'; import Button from '@/components/common/Button';
export default function ChatInterface(){
  const [text,setText]=useState(''); const [resp,setResp]=useState<{ summary:string; suggestions:string[] }|null>(null);
  return (<Card>
    <Input placeholder='Cuéntame tu sesión...' value={text} onChangeText={setText} style={{ marginBottom:10 }} />
    <Button title='Pedir insights' onPress={async()=> setResp(await getAIInsights({ text }))} />
    {resp && (<View style={{ marginTop:10 }}>
      <Text style={{ fontWeight:'700' }}>Resumen:</Text><Text>{resp.summary}</Text>
      <Text style={{ fontWeight:'700', marginTop:6 }}>Sugerencias:</Text>
      {resp.suggestions.map((s,i)=>(<Text key={i}>• {s}</Text>))}
    </View>)}
  </Card>);
}
