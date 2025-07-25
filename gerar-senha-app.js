/**
 * Instruções para gerar senha de aplicativo para Gmail
 */
console.log('='.repeat(70));
console.log('COMO GERAR UMA SENHA DE APLICATIVO PARA O GMAIL');
console.log('='.repeat(70));
console.log('\nPara usar o Gmail com o sistema PLI Cadastros, você precisa:');
console.log('\n1. Ativar a verificação em duas etapas na sua conta Google:');
console.log('   - Acesse: https://myaccount.google.com/security');
console.log('   - Clique em "Verificação em duas etapas" e siga as instruções');

console.log('\n2. Gerar uma senha de aplicativo:');
console.log('   - Acesse: https://myaccount.google.com/apppasswords');
console.log('   - Em "Selecionar app", escolha "Outro (Nome personalizado)"');
console.log('   - Digite "PLI Cadastros" e clique em "Gerar"');
console.log('   - O Google mostrará uma senha de 16 caracteres');
console.log('   - Copie essa senha');

console.log('\n3. Atualizar o arquivo .env:');
console.log('   - Abra o arquivo config/.env');
console.log('   - Substitua a senha atual pela senha de aplicativo gerada');
console.log('   - Exemplo: SMTP_PASS=abcd efgh ijkl mnop');

console.log('\n4. Testar o envio de email:');
console.log('   - Execute: npm run test-email');

console.log('\nOBS: A senha de aplicativo é mais segura e permite que o Gmail');
console.log('aceite conexões do sistema sem comprometer a segurança da sua conta.');
console.log('='.repeat(70));