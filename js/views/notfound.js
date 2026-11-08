(function (root) {
  'use strict';
  var App = root.App;
  App.views = App.views || {};

  App.views.notfound = function () {
    var ui = App.ui;
    return '<section class="notfound card">' + ui.icon('compass', 'notfound__icon') +
      '<h1 class="page-title">Página não encontrada</h1>' +
      '<p class="lead">O endereço que você abriu não existe ou foi movido. Use um dos atalhos abaixo para continuar.</p>' +
      '<div class="notfound__actions">' +
      ui.btn({ label: 'Ir para a página inicial', href: '#/', variant: 'primary', icon: 'home' }) +
      ui.btn({ label: 'Ver meus cursos', href: '#/cursos', icon: 'graduation' }) +
      '</div></section>';
  };
})(typeof window !== 'undefined' ? window : this);
