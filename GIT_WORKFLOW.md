# Guia Profissional de Git - HelpEconomia

Este guia descreve o fluxo de trabalho profissional para versionamento do seu sistema.

## 1. Configuração Inicial (Apenas na primeira vez)

Como o Git já foi iniciado, você precisa apenas configurar sua identidade e criar as branches principais.

Abra o terminal na pasta do projeto e execute (substitua pelos seus dados):

```bash
# 1. Configure seu nome e email
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# 2. Faça o primeiro commit (arquivos já estão adicionados)
git commit -m "Primeiro commit do sistema"

# 3. Defina a branch principal como 'main'
git branch -M main

# 4. Crie a branch de desenvolvimento
git checkout -b develop
```

## 2. Conectando com GitHub/GitLab

1. Crie um repositório vazio no GitHub/GitLab.
2. Copie a URL do repositório (ex: `https://github.com/usuario/controle-financeiro.git`).
3. Adicione a origem e suba o código:

```bash
git remote add origin SUA_URL_DO_REPO
git push -u origin main
git push -u origin develop
```

## 3. Fluxo de Trabalho Diário (Development)

Sempre trabalhe na branch `develop`. **Nunca** faça commits diretos na `main`.

1. **Antes de começar**, garanta que está na develop e atualizado:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Faça suas alterações** no código.

3. **Salve suas alterações**:
   ```bash
   git add .
   git commit -m "Descrição do que foi feito (ex: Adiciona filtro de datas no dashboard)"
   ```

4. **Envie para o repositório online**:
   ```bash
   git push origin develop
   ```

## 4. Subindo Novas Versões (Deploy/Release)

Quando o código na `develop` estiver testado e pronto para ir ao ar (produção), você fará o merge para a `main`.

1. Mude para a main e atualize:
   ```bash
   git checkout main
   git pull origin main
   ```

2. Traga as alterações da develop:
   ```bash
   git merge develop
   ```

3. Suba a nova versão para produção:
   ```bash
   git push origin main
   ```

---
**Dica Pro**: Se quiser voltar a programar depois do deploy, lembre-se de rodar `git checkout develop`!
