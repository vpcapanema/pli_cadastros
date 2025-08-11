/**
 * Página Pública: Cadastro de Usuário
 * Fornece lógica de preenchimento dinâmico e validação leve.
 * (Versão inicial gerada para resolver 404) 
 */

(function(){
  console.log('[cadastro-usuario] init');
  const form = document.getElementById('usuarioPublicForm');
  if(!form){return;}

  // Util: força labels visíveis (caso CSS esconda inadvertidamente)
  document.querySelectorAll('#usuarioPublicForm label').forEach(l=>{
    l.style.visibility='visible';
    l.style.opacity='1';
  });

  // Placeholder de carregamento de pessoas físicas / instituições (substituir por chamadas reais quando API estiver definida)
  async function loadPessoasFisicas(){
    // TODO integrar endpoint real. Evita erro silencioso.
  }
  async function loadInstituicoes(){
    // TODO integrar endpoint real.
  }

  // Geração automática de username a partir do email institucional
  const emailInst = document.getElementById('email_institucional');
  const username = document.getElementById('username');
  if(emailInst && username){
    emailInst.addEventListener('blur',()=>{
      if(emailInst.value && !username.value){
        username.value = emailInst.value.split('@')[0];
      }
    });
  }

  // Validação simples de senha
  const senha = document.getElementById('senha');
  const confirmar = document.getElementById('confirmarSenha');
  if(senha && confirmar){
    confirmar.addEventListener('input',()=>{
      if(confirmar.value && senha.value !== confirmar.value){
        confirmar.classList.add('is-invalid');
      } else {confirmar.classList.remove('is-invalid');}
    });
  }

  form.addEventListener('submit', (e)=>{
    if(senha && confirmar && senha.value !== confirmar.value){
      e.preventDefault();
      confirmar.classList.add('is-invalid');
      return;
    }
  });

  // Inicializações
  loadPessoasFisicas();
  loadInstituicoes();
})();
