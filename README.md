# SOBRE O PROJETO

<body>
    <ul>
        <h3>FOODFY</h3>
        <li> 
        <p>Foodfy é um projeto realizado durante o <strong>Bootcamp</strong> da <strong>Rocketseat.</strong></p>
        </li>
        <li>
        <p>Um projeto voltado à culinária (um site de receitas, com gerenciamento de usuários), baseado em tecnologias que fazem sentido juntas.</p>
        </li>
    </ul>
</body>
<br>

------
## Tecnologias e Frameworks

### **Backend:** 
>* *JavaScript ([NodeJS])*

>* SQL Server ([PostgresSQL])

>* Framework [Express]

### **Frontend:** 
>* *Nunjucks ([Nunjucks])*

>* JavaScript

>* HTML

>* CSS3

<br>

## `Como Utilizar:`

1. Baixe [o projeto] com:
    * `git clone()`

    **ou**
    
    * Baixe o projeto como _zip_.

2. Execute **`npm install`** no terminal para instalar as dependências deste projeto.

3. Configure o acesso ao Banco de dados (utilizando o Postgres), no arquivo __src/config/db.js__

4. Caso não possua o banco foodfy com suas tabelas criado, execute os comandos presente no arquivo foodfy.sql.

5. Após configurar o arquivo _db.js_ e criar o banco, execute o arquivo seed.js (`node seed.js`) para popular alguns dados e testar a aplicação.

6. Execute `npm start` para iniciar a aplicação. Abra o navegador em (**http://localhost:5000/**)
    * Obs: ***Tome Cuidado*** ao __excluir__ as entidades, pois _**a grande maioria das imagens**_ serão compartilhadas entre si, caso exclua algum chefe, usuário ou receita, reponha uma imagem como padrão no caminho **public/images/recipes-and-chefs/**, sendo __chefs.jpg__ para chefes e __recipes.png__ para receitas.

### Um pouco mais de arroz

Para utlizar o serviço de email, configure o [mailtrap] no arquivo **src/lib/mailer.js**, colocando suas credenciais.

Todas as senhas do seed.js são padronizadas ('123'), pegue um email da tabela users e utilize um usuário na rota de login (`/users/login`).

Considere em limpar o banco eventualmente, executando os comandos finais do arquivo **foodfy.sql** (está na tag `--restart to run seed.js`).

<!-- links -->

[Express]:https://expressjs.com/
[NodeJS]:https://nodejs.org/en/
[PostgresSQL]:https://www.postgresql.org/
[Nunjucks]:https://mozilla.github.io/nunjucks/
[o projeto]:https://github.com/wejesuss/Foodfy.git
[mailtrap]:https://mailtrap.io/