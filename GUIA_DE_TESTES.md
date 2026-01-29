# 🔍 Guia de Teste - Sistema FinanSmart

## Status dos Serviços

Verifique se todos estão rodando:
```bash
docker ps
```

Esperado: 3 containers ativos
- ✅ finansmart_mysql (porta 3306)
- ✅ finansmart_backend (porta 5000)
- ✅ finansmart_frontend (porta 3000)

---

## Teste 1: Backend API

Abra o navegador e acesse:
```
http://localhost:5000/health
```

**Esperado:** 
```json
{
  "status": "OK",
  "message": "FinanSmart API is running"
}
```

---

## Teste 2: Frontend

Acesse:
```
http://localhost:3000
```

**Esperado:** Página de login do FinanSmart

---

## Teste 3: Login

Na página de login, use:
- **Email**: `fcso.oliveira@gmail.com`
- **Senha**: `Castr0@2715`

Clique em "Entrar"

**Esperado:** Redirecionar para o Dashboard

---

## Teste 4: Criar Transação com Acentos

1. Vá para "Planilhas"
2. Clique em "Adicionar" no bloco "Gastos"
3. Digite:
   - **Descrição**: `Açaí com açúcar`
   - **Valor**: `15.50`
   - **Categoria**: Alimentação
   - **Data**: Hoje
4. Salve

**Teste de UTF-8:** Volte à página, recarregue (F5)
- ✅ Deve mostrar: "Açaí com açúcar" (correto)
- ❌ Se aparecer: "AÃ§aÃ­ com aÃ§Ãºcar" (charset errado)

---

## Problema Identificado?

### Se não aparece nada no frontend:
1. Verifique console do navegador (F12)
2. Procure erros de conexão com API

### Se o login não funciona:
1. Abra console do navegador (F12)
2. Veja se há erros de CORS ou conexão

### Se símbolos aparecem errados:
```bash
# Conectar ao MySQL e verificar charset
docker exec -it finansmart_mysql mysql -u root -p

# Senha: root_password_2024

# Dentro do MySQL:
SHOW VARIABLES LIKE 'character%';
```

**Esperado:**
- character_set_server: `utf8mb4`
- character_set_database: `utf8mb4`

---

## Resetar Tudo (Se necessário)

```bash
# Parar tudo e limpar volumes
docker-compose down -v

# Reconstruir
docker-compose up -d --build

# Aguardar ~30 segundos para MySQL inicializar
```

---

## Me diga qual teste falhou

Por favor, execute os testes acima e me diga:
1. Qual teste específico está falhando?
2. Que erro aparece? (screenshot ou mensagem)
3. O que você vê no console do navegador (F12)?

Assim posso resolver o problema exato! 🎯
