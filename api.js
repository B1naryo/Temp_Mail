// Função para obter o usuário e o domínio a partir do endereço de e-mail
function getUserAndDomain() {
  const addr = $("#addr").val();
  if (!addr) {
    alert("Please generate or input an email address first!");
    return null;
  }

  const [user, domain] = addr.split("@");
  if (!user || !domain) {
    alert("Invalid email address format!");
    return null;
  }
  return { user, domain };
}

// Função para gerar um novo endereço de e-mail aleatório
function genEmail() {
  $.getJSON(
    "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1",
    (res) => {
      $("#addr").val(res[0]);
      refreshMail();
    }
  );
}

// Função para atualizar a lista de e-mails
function refreshMail() {
  const userAndDomain = getUserAndDomain();
  if (!userAndDomain) return;
  const { user, domain } = userAndDomain;

  $.getJSON(
    `https://www.1secmail.com/api/v1/?action=getMessages&login=${user}&domain=${domain}`,
    (emails) => {
      const emailsElement = $("#emails");
      emailsElement.empty();

      // Adiciona cabeçalho da tabela
      emailsElement.append(`
        <tr>
          <th><b>ID</b></th>
          <th><b>From</b></th>
          <th><b>Subject</b></th>
          <th><b>Date</b></th>
          <th><b>Content</b></th>
        </tr>
      `);

      // Adiciona linhas da tabela para cada e-mail
      emails.forEach(email => {
        emailsElement.append(`
          <tr>
            <td>${email.id}</td>
            <td>${email.from}</td>
            <td>${email.subject}</td>
            <td>${email.date}</td>
            <td id="${email.id}"><a onclick="loadEmail('${email.id}')">Load content...</a></td>
          </tr>
        `);
      });
    }
  );
}

// Função para carregar o conteúdo de um e-mail específico
function loadEmail(id) {
  const userAndDomain = getUserAndDomain();
  if (!userAndDomain) return;
  const { user, domain } = userAndDomain;

  $.getJSON(
    `https://www.1secmail.com/api/v1/?action=readMessage&login=${user}&domain=${domain}&id=${id}`,
    (email) => {
      const elm = $(`#${id}`);
      if (email.htmlBody) {
        elm.html(email.htmlBody);
      } else {
        elm.text(email.body);
      }

      // Adiciona anexos se houver
      if (email.attachments && email.attachments.length > 0) {
        const atts = $("<div></div>");
        email.attachments.forEach(file => {
          atts.append(
            `<a href='https://www.1secmail.com/api/v1/?action=download&login=${user}&domain=${domain}&id=${id}&file=${file.filename}'>${file.filename}</a>`
          );
        });
        elm.append(atts);
      }
    }
  );
}

// Gera um novo e-mail ao carregar a página
$(genEmail);

