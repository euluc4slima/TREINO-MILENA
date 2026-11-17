'use strict';
/* Política de privacidade local (também disponível em PRIVACIDADE.md no repositório) */
V.privacy = () => head('Privacidade', { back: true, sub: 'Como seus dados são tratados' }) + `<section class="card prose">
  <h3>Resumo</h3><p>O Projeto Evolução é um aplicativo de uso individual. Tudo o que você registra fica guardado <b>somente neste aparelho</b>. Não existe conta, login, servidor nem envio de dados.</p>
  <h3>O que é armazenado</h3><p>Perfil, peso, medidas, fotografias de evolução, treinos, séries, cargas, alimentação, observações, diário e preferências. Os dados ficam no banco local do navegador (IndexedDB), dentro do espaço reservado a este app.</p>
  <h3>O que nunca acontece</h3><ul><li>Nenhum dado pessoal é transmitido pela internet.</li><li>Não há ferramentas de rastreamento, estatísticas de uso ou publicidade.</li><li>Fotografias não saem do aparelho e não passam por análise automática.</li><li>O app não carrega fontes, scripts ou imagens de terceiros.</li></ul>
  <h3>Quando há comunicação com a internet</h3><ul><li>Para baixar o próprio aplicativo e suas atualizações do endereço em que ele foi publicado.</li><li>Quando você toca em um botão que abre a pesquisa de um exercício no YouTube. Nesse caso o nome do exercício é enviado ao YouTube, que tem política própria.</li></ul>
  <h3>Backups</h3><p>Os dados só saem do aparelho quando você exporta um backup ou um CSV. O arquivo exportado contém informações pessoais e, se você escolher, as fotos. Guarde-o em local seguro e não o publique.</p>
  <h3>Lembretes</h3><p>Notificações são geradas no próprio aparelho. Exportar lembretes para o Calendário cria um arquivo que você decide abrir ou não.</p>
  <h3>Como apagar seus dados</h3><p>Em Perfil → Apagar todos os dados, ou removendo o app da Tela de Início e limpando os dados do site nos Ajustes do Safari.</p>
  <h3>Aviso</h3><p>Ferramenta de organização e acompanhamento. Não realiza diagnóstico nem prescrição médica, nutricional ou de treinamento.</p></section>`;
