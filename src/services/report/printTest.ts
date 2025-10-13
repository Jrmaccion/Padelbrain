// src/services/report/printTest.ts
import { Platform, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function printHelloPdf(): Promise<void> {
  const html = `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Test PDF</title>
        <style>
          body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
                 height: 100vh; display: flex; align-items: center; justify-content: center; }
          h1 { font-size: 48px; color: #111827; }
        </style>
      </head>
      <body>
        <h1>Hola</h1>
      </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      // En web: generar y descargar automáticamente
      const { uri } = await Print.printToFileAsync({ html });

      const response = await fetch(uri);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'PadelBrain-Test.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Alert.alert('Test exitoso', 'El PDF de prueba se ha descargado correctamente.');
      return;
    }

    // En nativo generamos el archivo y lo compartimos si es posible
    const { uri } = await Print.printToFileAsync({ html });
    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Test PDF',
        mimeType: 'application/pdf',
      });
    } else {
      Alert.alert('PDF generado', `Ruta del PDF: ${uri}`);
    }
  } catch (e: any) {
    Alert.alert('Error', e?.message ?? 'No se pudo generar el PDF de prueba');
  }
}
