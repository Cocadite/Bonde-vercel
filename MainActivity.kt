package com.olhodeus.app

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class MainActivity : AppCompatActivity() {

    private lateinit var editTextAlvo: EditText
    private lateinit var buttonBuscar: Button
    private lateinit var textViewConsole: TextView

    private val client = OkHttpClient()
    private val JSON = "application/json; charset=utf-8".toMediaType()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main) // Assumindo que o layout é activity_main.xml

        editTextAlvo = findViewById(R.id.editTextAlvo)
        buttonBuscar = findViewById(R.id.buttonBuscar)
        textViewConsole = findViewById(R.id.textViewConsole)

        // O tema preto e branco é aplicado via XML (activity_main.xml, colors.xml, themes.xml).
        // Nenhuma alteração direta no código Kotlin é necessária para a estética.

        buttonBuscar.setOnClickListener {
            val alvo = editTextAlvo.text.toString()
            if (alvo.isNotBlank()) {
                buscarDados(alvo)
            } else {
                updateConsole("status: ERRO - O campo \'alvo\' não pode estar vazio.")
            }
        }
    }

    private fun buscarDados(alvo: String) {
        buttonBuscar.isEnabled = false // Desabilita o botão para evitar requisições duplicadas
        updateConsole("status: INICIALIZANDO_PROCESSO")

        val jsonPayload = JSONObject().apply {
            put("alvo", alvo)
        }
        val body = jsonPayload.toString().toRequestBody(JSON)

        val request = Request.Builder()
            .url("http://127.0.0.1:5000/buscar")
            .post(body)
            .build()

        updateConsole("status: AGUARDANDO_PONTE_TELEGRAM")

        CoroutineScope(Dispatchers.IO).launch {
            try {
                client.newCall(request).execute().use {
                    response ->
                    val responseBody = response.body?.string()
                    if (response.isSuccessful && responseBody != null) {
                        val jsonResponse = JSONObject(responseBody)
                        val resultado = jsonResponse.optString("resultado", "Nenhum resultado encontrado.")
                        withContext(Dispatchers.Main) {
                            updateConsole("status: SUCESSO \n [DADOS] $resultado")
                        }
                    } else {
                        withContext(Dispatchers.Main) {
                            updateConsole("status: ERRO - Falha na requisição: ${response.code} ${response.message}")
                        }
                    }
                }
            } catch (e: IOException) {
                withContext(Dispatchers.Main) {
                    updateConsole("status: ERRO - Falha de rede (Timeout/Connection Refused): ${e.message}")
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    updateConsole("status: ERRO - Ocorreu um erro inesperado: ${e.message}")
                }
            } finally {
                withContext(Dispatchers.Main) {
                    buttonBuscar.isEnabled = true // Habilita o botão novamente
                }
            }
        }
    }

    private fun updateConsole(message: String) {
        runOnUiThread {
            textViewConsole.append("$message\n")
            // Opcional: rolar para o final do TextView
            textViewConsole.post { textViewConsole.scrollTo(0, textViewConsole.layout.height) }
        }
    }
}
