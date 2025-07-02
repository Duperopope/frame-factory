#!/usr/bin/env python3
"""
Serveur HTTP simple pour FRAME Factory
Résout les problèmes CORS pour le développement local
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from urllib.parse import urlparse

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    port = 8000
    
    # Changer vers le répertoire du projet
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
            print(f"🚀 FRAME Factory Server démarré sur http://localhost:{port}")
            print(f"📁 Répertoire: {os.getcwd()}")
            print("🌐 Ouverture du navigateur...")
            print("⏹️  Appuyez sur Ctrl+C pour arrêter le serveur")
            
            # Ouvrir le navigateur
            webbrowser.open(f'http://localhost:{port}')
            
            # Démarrer le serveur
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Serveur arrêté")
        sys.exit(0)
    except OSError as e:
        if e.errno == 10048:  # Port déjà utilisé
            print(f"❌ Le port {port} est déjà utilisé")
            print("💡 Essayez de fermer d'autres serveurs ou utilisez un autre port")
        else:
            print(f"❌ Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
