export function getErrorMessage(error) {
  if (!error) {
    return 'Ocorreu um erro inesperado.'
  }

  const message = String(
    error.message || ''
  ).toLowerCase()

  const code = String(
    error.code || ''
  ).toLowerCase()


  /* ======================================================
     AUTENTICAÇÃO
  ====================================================== */

  if (
    message.includes(
      'invalid login credentials'
    )
  ) {
    return 'E-mail ou senha incorretos.'
  }


  if (
    message.includes(
      'email not confirmed'
    )
  ) {
    return 'O e-mail desta conta ainda não foi confirmado.'
  }


  if (
    message.includes(
      'user not found'
    )
  ) {
    return 'Usuário não encontrado.'
  }


  if (
    message.includes(
      'password should be'
    )
  ) {
    return 'A senha informada não atende aos requisitos mínimos.'
  }


  if (
    message.includes(
      'too many requests'
    )
  ) {
    return 'Muitas tentativas foram realizadas. Aguarde um momento e tente novamente.'
  }


  /* ======================================================
     PERMISSÕES / RLS
  ====================================================== */

  if (
    message.includes(
      'row-level security'
    ) ||
    message.includes(
      'violates row-level security'
    )
  ) {
    return 'Você não tem permissão para realizar esta operação.'
  }


  if (
    message.includes(
      'permission denied'
    )
  ) {
    return 'Acesso negado para realizar esta operação.'
  }


  /* ======================================================
     BANCO DE DADOS
  ====================================================== */

  if (
    code === '23505' ||
    message.includes(
      'duplicate key value'
    )
  ) {
    return 'Já existe um registro com essas informações.'
  }


  if (
    code === '23503' ||
    message.includes(
      'foreign key constraint'
    )
  ) {
    return 'Este registro está relacionado a outras informações e não pode ser removido.'
  }


  if (
    code === '23502' ||
    message.includes(
      'null value in column'
    )
  ) {
    return 'Preencha todos os campos obrigatórios.'
  }


  if (
    message.includes(
      'invalid input syntax'
    )
  ) {
    return 'Uma das informações preenchidas possui um formato inválido.'
  }


  /* ======================================================
     STORAGE
  ====================================================== */

  if (
    message.includes(
      'bucket not found'
    )
  ) {
    return 'O local de armazenamento das imagens não foi encontrado.'
  }


  if (
    message.includes(
      'resource already exists'
    )
  ) {
    return 'Já existe um arquivo com esse nome.'
  }


  if (
    message.includes(
      'payload too large'
    ) ||
    message.includes(
      'maximum allowed size'
    )
  ) {
    return 'A imagem selecionada é maior que o tamanho permitido.'
  }


  if (
    message.includes(
      'mime type'
    )
  ) {
    return 'O formato do arquivo selecionado não é permitido.'
  }


  /* ======================================================
     CONEXÃO
  ====================================================== */

  if (
    message.includes(
      'failed to fetch'
    ) ||
    message.includes(
      'network'
    )
  ) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
  }


  /* ======================================================
     PADRÃO
  ====================================================== */

  console.error(
    'Erro não traduzido:',
    error
  )

  return 'Não foi possível concluir a operação. Tente novamente.'
}