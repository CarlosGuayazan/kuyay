// =====================================================================
//  MULTI-IDIOMA (internacionalización / i18n)
// ---------------------------------------------------------------------
//  Todos los textos de la app viven aquí, en 6 idiomas.
//  Para cambiar una palabra: edítala en el idioma correspondiente.
//
//  Uso desde otros archivos:
//    I18N.t("clave")          -> texto traducido
//    I18N.t("clave", {trm})   -> reemplaza {trm} por el valor
//    I18N.locale              -> "es-CO", "en-US", etc. (para fechas/moneda)
//    I18N.onChange(fn)        -> ejecuta fn cuando se cambia de idioma
// =====================================================================

(function () {
  const traducciones = {
    es: {
      heroTitle: "Consulta tu Reservación",
      heroSubtitle:
        "Ingresa uno de tus datos y te mostraremos tu reservación activa.",
      formAyuda:
        "Para proteger tu privacidad, te recomendamos buscar con tu número de reservación junto con tu correo.",
      lblNumero: "Número de reservación",
      phNumero: "Ej: 20491561",
      lblEmail: "Correo electrónico",
      phEmail: "tucorreo@ejemplo.com",
      masOpciones: "Más opciones de búsqueda",
      lblNombre: "Nombre del titular",
      phNombre: "Ej: Isabel Guerra",
      lblTelefono: "Teléfono",
      phTelefono: "Ej: +57 312 5772922",
      btnBuscar: "Buscar reservación",
      btnBuscando: "Buscando...",
      dispTitulo: "¿Aún no tienes reserva?",
      dispAyuda:
        "Consulta disponibilidad y reserva en línea. Elige tu hostel:",
      footer: "Hotel Kuyay · Sistema de consulta de reservaciones",
      msgValida: "Por favor ingresa al menos un dato para buscar.",
      msgCargando: "Consultando tu reservación, un momento...",
      msgConexion:
        "Hubo un problema de conexión. Intenta de nuevo en unos segundos.",
      msgNoEncontrada:
        "No se encontró ninguna reservación con los datos proporcionados.",
      rcReserva: "Reservación",
      rcReservaDirecta: "Reserva directa",
      rcHuesped: "Huésped",
      rcCorreo: "Correo",
      rcTelefono: "Teléfono",
      rcPais: "País",
      rcHabitacion: "Habitación",
      rcEntrada: "Entrada (check-in)",
      rcSalida: "Salida (check-out)",
      rcHuespedes: "Huéspedes",
      rcTotal: "Total a pagar",
      rcPagado: "Pagado",
      rcCheckinReal: "Check-in realizado",
      rcCheckoutReal: "Check-out realizado",
      estadoSi: "Sí",
      estadoNo: "No",
      btnCheckin: "✅ Completa tu registro en línea",
      checkinListo: "✔️ Tu registro ya está completo.",
      qrCheckin: "📱 Escanea con tu celular para completar tu registro",
      qrPagar: "📱 Escanea con tu celular para continuar el pago",
      qrReservar: "📱 Escanea con tu celular para reservar",
      pagSaldo: "Saldo pendiente:",
      pagElige: "Elige cómo deseas pagar:",
      pagBtnTransfer: "🏦 Transferencia",
      pagBtnWompi: "💳 Tarjeta · Wompi (+5%)",
      pagBtnPaypal: "🅿️ PayPal",
      pagBtnCripto: "🪙 Criptomonedas",
      trTitulo: "🏦 Pago por transferencia",
      trLlave: "Llave Bre-B:",
      trNequi: "Nequi:",
      trDaviplata: "Daviplata:",
      trBancolombia: "Bancolombia Ahorros:",
      trANombre: "A nombre de:",
      trReporta:
        "📲 Reporta tu pago enviando el comprobante por WhatsApp:",
      trBtnWhatsapp: "Reportar por WhatsApp",
      btnFinalizar: "Finalizar",
      woTitulo: "💳 Pago con tarjeta (Wompi)",
      woRecargo: "⚠️ Esta opción tiene un recargo del 5%.",
      woSaldo: "Saldo:",
      woTotal: "Total a pagar:",
      woBtnPagar: "Pagar con Wompi",
      woEscanea: "o escanea este código QR:",
      ppTitulo: "🅿️ Pago con PayPal",
      ppEnvia: "Envía el pago a este usuario de PayPal:",
      montoLbl: "Monto:",
      notaTasa:
        "Calculado con la TRM de hoy ({trm}) menos $300 COP = tasa de {tasa} por dólar.",
      ppReporta:
        "📲 Luego reporta tu pago enviando el comprobante por WhatsApp:",
      crTitulo: "🪙 Pago con Criptomonedas",
      crBtnPagar: "Pagar con criptomonedas",
      calcCargando: "Calculando el monto en dólares con la TRM de hoy...",
      errTRM:
        "No pudimos obtener la tasa del dólar en este momento. Por favor intenta de nuevo en unos minutos.",
      kbEspacio: "espacio",
      kbBorrar: "⌫ Borrar",
      kbMayus: "⇧ Mayús",
      kbListo: "Listo ✓",
    },

    en: {
      heroTitle: "Check Your Reservation",
      heroSubtitle:
        "Enter one of your details and we'll show your active reservation.",
      formAyuda:
        "To protect your privacy, we recommend searching with your reservation number together with your email.",
      lblNumero: "Reservation number",
      phNumero: "E.g. 20491561",
      lblEmail: "Email",
      phEmail: "youremail@example.com",
      masOpciones: "More search options",
      lblNombre: "Guest name",
      phNombre: "E.g. Isabel Guerra",
      lblTelefono: "Phone",
      phTelefono: "E.g. +57 312 5772922",
      btnBuscar: "Search reservation",
      btnBuscando: "Searching...",
      dispTitulo: "Don't have a booking yet?",
      dispAyuda: "Check availability and book online. Choose your hostel:",
      footer: "Hotel Kuyay · Reservation lookup system",
      msgValida: "Please enter at least one detail to search.",
      msgCargando: "Looking up your reservation, one moment...",
      msgConexion:
        "There was a connection problem. Please try again in a few seconds.",
      msgNoEncontrada: "No reservation was found with the provided details.",
      rcReserva: "Reservation",
      rcReservaDirecta: "Direct booking",
      rcHuesped: "Guest",
      rcCorreo: "Email",
      rcTelefono: "Phone",
      rcPais: "Country",
      rcHabitacion: "Room",
      rcEntrada: "Check-in",
      rcSalida: "Check-out",
      rcHuespedes: "Guests",
      rcTotal: "Total to pay",
      rcPagado: "Paid",
      rcCheckinReal: "Check-in done",
      rcCheckoutReal: "Check-out done",
      estadoSi: "Yes",
      estadoNo: "No",
      btnCheckin: "✅ Complete your online check-in",
      checkinListo: "✔️ Your check-in is already complete.",
      qrCheckin: "📱 Scan with your phone to complete your check-in",
      qrPagar: "📱 Scan with your phone to continue the payment",
      qrReservar: "📱 Scan with your phone to book",
      pagSaldo: "Outstanding balance:",
      pagElige: "Choose how you'd like to pay:",
      pagBtnTransfer: "🏦 Bank transfer",
      pagBtnWompi: "💳 Card · Wompi (+5%)",
      pagBtnPaypal: "🅿️ PayPal",
      pagBtnCripto: "🪙 Cryptocurrency",
      trTitulo: "🏦 Payment by bank transfer",
      trLlave: "Bre-B key:",
      trNequi: "Nequi:",
      trDaviplata: "Daviplata:",
      trBancolombia: "Bancolombia Savings:",
      trANombre: "Account holder:",
      trReporta:
        "📲 Report your payment by sending the receipt via WhatsApp:",
      trBtnWhatsapp: "Report via WhatsApp",
      btnFinalizar: "Finish",
      woTitulo: "💳 Card payment (Wompi)",
      woRecargo: "⚠️ This option has a 5% surcharge.",
      woSaldo: "Balance:",
      woTotal: "Total to pay:",
      woBtnPagar: "Pay with Wompi",
      woEscanea: "or scan this QR code:",
      ppTitulo: "🅿️ Payment with PayPal",
      ppEnvia: "Send the payment to this PayPal user:",
      montoLbl: "Amount:",
      notaTasa:
        "Calculated with today's official rate (TRM {trm}) minus 300 COP = rate of {tasa} per dollar.",
      ppReporta:
        "📲 Then report your payment by sending the receipt via WhatsApp:",
      crTitulo: "🪙 Payment with Cryptocurrency",
      crBtnPagar: "Pay with cryptocurrency",
      calcCargando:
        "Calculating the amount in dollars with today's exchange rate...",
      errTRM:
        "We couldn't get the dollar exchange rate right now. Please try again in a few minutes.",
      kbEspacio: "space",
      kbBorrar: "⌫ Delete",
      kbMayus: "⇧ Shift",
      kbListo: "Done ✓",
    },

    de: {
      heroTitle: "Reservierung abfragen",
      heroSubtitle:
        "Geben Sie eine Ihrer Angaben ein und wir zeigen Ihre aktive Reservierung.",
      formAyuda:
        "Zum Schutz Ihrer Privatsphäre empfehlen wir die Suche mit Ihrer Reservierungsnummer zusammen mit Ihrer E-Mail.",
      lblNumero: "Reservierungsnummer",
      phNumero: "z. B. 20491561",
      lblEmail: "E-Mail",
      phEmail: "ihremail@beispiel.com",
      masOpciones: "Weitere Suchoptionen",
      lblNombre: "Name des Gastes",
      phNombre: "z. B. Isabel Guerra",
      lblTelefono: "Telefon",
      phTelefono: "z. B. +57 312 5772922",
      btnBuscar: "Reservierung suchen",
      btnBuscando: "Suche läuft...",
      dispTitulo: "Noch keine Buchung?",
      dispAyuda:
        "Verfügbarkeit prüfen und online buchen. Wählen Sie Ihr Hostel:",
      footer: "Hotel Kuyay · Reservierungsabfrage-System",
      msgValida: "Bitte geben Sie mindestens eine Angabe für die Suche ein.",
      msgCargando: "Ihre Reservierung wird gesucht, einen Moment...",
      msgConexion:
        "Es gab ein Verbindungsproblem. Bitte versuchen Sie es in einigen Sekunden erneut.",
      msgNoEncontrada:
        "Es wurde keine Reservierung mit den angegebenen Daten gefunden.",
      rcReserva: "Reservierung",
      rcReservaDirecta: "Direktbuchung",
      rcHuesped: "Gast",
      rcCorreo: "E-Mail",
      rcTelefono: "Telefon",
      rcPais: "Land",
      rcHabitacion: "Zimmer",
      rcEntrada: "Check-in",
      rcSalida: "Check-out",
      rcHuespedes: "Gäste",
      rcTotal: "Zu zahlender Betrag",
      rcPagado: "Bezahlt",
      rcCheckinReal: "Check-in erfolgt",
      rcCheckoutReal: "Check-out erfolgt",
      estadoSi: "Ja",
      estadoNo: "Nein",
      btnCheckin: "✅ Online-Check-in abschließen",
      checkinListo: "✔️ Ihr Check-in ist bereits abgeschlossen.",
      qrCheckin: "📱 Mit dem Handy scannen, um den Check-in abzuschließen",
      qrPagar: "📱 Mit dem Handy scannen, um die Zahlung fortzusetzen",
      qrReservar: "📱 Mit dem Handy scannen, um zu buchen",
      pagSaldo: "Offener Betrag:",
      pagElige: "Wählen Sie Ihre Zahlungsart:",
      pagBtnTransfer: "🏦 Überweisung",
      pagBtnWompi: "💳 Karte · Wompi (+5%)",
      pagBtnPaypal: "🅿️ PayPal",
      pagBtnCripto: "🪙 Kryptowährung",
      trTitulo: "🏦 Zahlung per Überweisung",
      trLlave: "Bre-B-Schlüssel:",
      trNequi: "Nequi:",
      trDaviplata: "Daviplata:",
      trBancolombia: "Bancolombia Sparkonto:",
      trANombre: "Kontoinhaber:",
      trReporta:
        "📲 Melden Sie Ihre Zahlung, indem Sie den Beleg per WhatsApp senden:",
      trBtnWhatsapp: "Per WhatsApp melden",
      btnFinalizar: "Fertig",
      woTitulo: "💳 Kartenzahlung (Wompi)",
      woRecargo: "⚠️ Bei dieser Option fällt ein Aufschlag von 5% an.",
      woSaldo: "Saldo:",
      woTotal: "Zu zahlender Betrag:",
      woBtnPagar: "Mit Wompi bezahlen",
      woEscanea: "oder scannen Sie diesen QR-Code:",
      ppTitulo: "🅿️ Zahlung mit PayPal",
      ppEnvia: "Senden Sie die Zahlung an diesen PayPal-Nutzer:",
      montoLbl: "Betrag:",
      notaTasa:
        "Berechnet mit dem heutigen amtlichen Kurs (TRM {trm}) minus 300 COP = Kurs von {tasa} pro Dollar.",
      ppReporta:
        "📲 Melden Sie anschließend Ihre Zahlung, indem Sie den Beleg per WhatsApp senden:",
      crTitulo: "🪙 Zahlung mit Kryptowährung",
      crBtnPagar: "Mit Kryptowährung bezahlen",
      calcCargando:
        "Der Betrag in Dollar wird mit dem heutigen Wechselkurs berechnet...",
      errTRM:
        "Der Dollarkurs konnte derzeit nicht abgerufen werden. Bitte versuchen Sie es in einigen Minuten erneut.",
      kbEspacio: "Leertaste",
      kbBorrar: "⌫ Löschen",
      kbMayus: "⇧ Umschalt",
      kbListo: "Fertig ✓",
    },

    fr: {
      heroTitle: "Consultez votre réservation",
      heroSubtitle:
        "Saisissez l'une de vos informations et nous afficherons votre réservation active.",
      formAyuda:
        "Pour protéger votre vie privée, nous vous recommandons de rechercher avec votre numéro de réservation et votre e-mail.",
      lblNumero: "Numéro de réservation",
      phNumero: "Ex : 20491561",
      lblEmail: "E-mail",
      phEmail: "votremail@exemple.com",
      masOpciones: "Plus d'options de recherche",
      lblNombre: "Nom du client",
      phNombre: "Ex : Isabel Guerra",
      lblTelefono: "Téléphone",
      phTelefono: "Ex : +57 312 5772922",
      btnBuscar: "Rechercher la réservation",
      btnBuscando: "Recherche...",
      dispTitulo: "Pas encore de réservation ?",
      dispAyuda:
        "Vérifiez la disponibilité et réservez en ligne. Choisissez votre hostel :",
      footer: "Hotel Kuyay · Système de consultation des réservations",
      msgValida:
        "Veuillez saisir au moins une information pour effectuer la recherche.",
      msgCargando: "Recherche de votre réservation, un instant...",
      msgConexion:
        "Un problème de connexion est survenu. Veuillez réessayer dans quelques secondes.",
      msgNoEncontrada:
        "Aucune réservation trouvée avec les informations fournies.",
      rcReserva: "Réservation",
      rcReservaDirecta: "Réservation directe",
      rcHuesped: "Client",
      rcCorreo: "E-mail",
      rcTelefono: "Téléphone",
      rcPais: "Pays",
      rcHabitacion: "Chambre",
      rcEntrada: "Arrivée (check-in)",
      rcSalida: "Départ (check-out)",
      rcHuespedes: "Clients",
      rcTotal: "Total à payer",
      rcPagado: "Payé",
      rcCheckinReal: "Check-in effectué",
      rcCheckoutReal: "Check-out effectué",
      estadoSi: "Oui",
      estadoNo: "Non",
      btnCheckin: "✅ Effectuez votre enregistrement en ligne",
      checkinListo: "✔️ Votre enregistrement est déjà effectué.",
      qrCheckin: "📱 Scannez avec votre téléphone pour faire votre enregistrement",
      qrPagar: "📱 Scannez avec votre téléphone pour continuer le paiement",
      qrReservar: "📱 Scannez avec votre téléphone pour réserver",
      pagSaldo: "Solde restant :",
      pagElige: "Choisissez votre mode de paiement :",
      pagBtnTransfer: "🏦 Virement",
      pagBtnWompi: "💳 Carte · Wompi (+5%)",
      pagBtnPaypal: "🅿️ PayPal",
      pagBtnCripto: "🪙 Cryptomonnaie",
      trTitulo: "🏦 Paiement par virement",
      trLlave: "Clé Bre-B :",
      trNequi: "Nequi :",
      trDaviplata: "Daviplata :",
      trBancolombia: "Bancolombia Épargne :",
      trANombre: "Titulaire :",
      trReporta:
        "📲 Signalez votre paiement en envoyant le justificatif via WhatsApp :",
      trBtnWhatsapp: "Signaler via WhatsApp",
      btnFinalizar: "Terminer",
      woTitulo: "💳 Paiement par carte (Wompi)",
      woRecargo: "⚠️ Cette option comporte un supplément de 5%.",
      woSaldo: "Solde :",
      woTotal: "Total à payer :",
      woBtnPagar: "Payer avec Wompi",
      woEscanea: "ou scannez ce code QR :",
      ppTitulo: "🅿️ Paiement avec PayPal",
      ppEnvia: "Envoyez le paiement à cet utilisateur PayPal :",
      montoLbl: "Montant :",
      notaTasa:
        "Calculé avec le taux officiel du jour (TRM {trm}) moins 300 COP = taux de {tasa} par dollar.",
      ppReporta:
        "📲 Signalez ensuite votre paiement en envoyant le justificatif via WhatsApp :",
      crTitulo: "🪙 Paiement avec Cryptomonnaie",
      crBtnPagar: "Payer avec cryptomonnaie",
      calcCargando:
        "Calcul du montant en dollars avec le taux de change du jour...",
      errTRM:
        "Nous n'avons pas pu obtenir le taux du dollar pour le moment. Veuillez réessayer dans quelques minutes.",
      kbEspacio: "espace",
      kbBorrar: "⌫ Effacer",
      kbMayus: "⇧ Maj",
      kbListo: "Terminé ✓",
    },

    zh: {
      heroTitle: "查询您的预订",
      heroSubtitle: "输入您的任一信息，我们将显示您的有效预订。",
      formAyuda: "为保护您的隐私，建议使用预订号和电子邮箱一起查询。",
      lblNumero: "预订号",
      phNumero: "例如：20491561",
      lblEmail: "电子邮箱",
      phEmail: "youremail@example.com",
      masOpciones: "更多搜索选项",
      lblNombre: "客人姓名",
      phNombre: "例如：Isabel Guerra",
      lblTelefono: "电话",
      phTelefono: "例如：+57 312 5772922",
      btnBuscar: "查询预订",
      btnBuscando: "查询中…",
      dispTitulo: "还没有预订？",
      dispAyuda: "查询空房并在线预订。请选择您的旅舍：",
      footer: "Hotel Kuyay · 预订查询系统",
      msgValida: "请至少输入一项信息进行查询。",
      msgCargando: "正在查询您的预订，请稍候…",
      msgConexion: "连接出现问题。请几秒后重试。",
      msgNoEncontrada: "未找到与所提供信息匹配的预订。",
      rcReserva: "预订",
      rcReservaDirecta: "直接预订",
      rcHuesped: "客人",
      rcCorreo: "电子邮箱",
      rcTelefono: "电话",
      rcPais: "国家",
      rcHabitacion: "房间",
      rcEntrada: "入住 (Check-in)",
      rcSalida: "退房 (Check-out)",
      rcHuespedes: "客人数",
      rcTotal: "应付总额",
      rcPagado: "已付",
      rcCheckinReal: "已办理入住",
      rcCheckoutReal: "已办理退房",
      estadoSi: "是",
      estadoNo: "否",
      btnCheckin: "✅ 在线完成登记",
      checkinListo: "✔️ 您的登记已完成。",
      qrCheckin: "📱 用手机扫码完成登记",
      qrPagar: "📱 用手机扫码继续付款",
      qrReservar: "📱 用手机扫码预订",
      pagSaldo: "未付余额：",
      pagElige: "请选择付款方式：",
      pagBtnTransfer: "🏦 银行转账",
      pagBtnWompi: "💳 银行卡 · Wompi (+5%)",
      pagBtnPaypal: "🅿️ PayPal",
      pagBtnCripto: "🪙 加密货币",
      trTitulo: "🏦 银行转账付款",
      trLlave: "Bre-B 密钥：",
      trNequi: "Nequi：",
      trDaviplata: "Daviplata：",
      trBancolombia: "Bancolombia 储蓄账户：",
      trANombre: "账户持有人：",
      trReporta: "📲 请通过 WhatsApp 发送付款凭证以报告您的付款：",
      trBtnWhatsapp: "通过 WhatsApp 报告",
      btnFinalizar: "完成",
      woTitulo: "💳 银行卡付款 (Wompi)",
      woRecargo: "⚠️ 此方式需额外收取 5% 手续费。",
      woSaldo: "余额：",
      woTotal: "应付总额：",
      woBtnPagar: "使用 Wompi 付款",
      woEscanea: "或扫描此二维码：",
      ppTitulo: "🅿️ 使用 PayPal 付款",
      ppEnvia: "请将款项发送至此 PayPal 用户：",
      montoLbl: "金额：",
      notaTasa: "按今日官方汇率 (TRM {trm}) 减 300 COP = 每美元 {tasa} 计算。",
      ppReporta: "📲 然后请通过 WhatsApp 发送付款凭证以报告您的付款：",
      crTitulo: "🪙 使用加密货币付款",
      crBtnPagar: "使用加密货币付款",
      calcCargando: "正在按今日汇率计算美元金额…",
      errTRM: "暂时无法获取美元汇率。请几分钟后重试。",
      kbEspacio: "空格",
      kbBorrar: "⌫ 删除",
      kbMayus: "⇧ 大写",
      kbListo: "完成 ✓",
    },

    ja: {
      heroTitle: "予約の確認",
      heroSubtitle: "いずれかの情報を入力すると、有効な予約を表示します。",
      formAyuda:
        "プライバシー保護のため、予約番号とメールアドレスの両方での検索をおすすめします。",
      lblNumero: "予約番号",
      phNumero: "例：20491561",
      lblEmail: "メールアドレス",
      phEmail: "youremail@example.com",
      masOpciones: "その他の検索オプション",
      lblNombre: "宿泊者名",
      phNombre: "例：Isabel Guerra",
      lblTelefono: "電話番号",
      phTelefono: "例：+57 312 5772922",
      btnBuscar: "予約を検索",
      btnBuscando: "検索中…",
      dispTitulo: "まだ予約がありませんか？",
      dispAyuda: "空室を確認してオンライン予約。ホステルを選択してください：",
      footer: "Hotel Kuyay · 予約照会システム",
      msgValida: "検索するには少なくとも1つの情報を入力してください。",
      msgCargando: "予約を検索しています。少々お待ちください…",
      msgConexion:
        "接続に問題が発生しました。数秒後にもう一度お試しください。",
      msgNoEncontrada: "入力された情報に一致する予約が見つかりませんでした。",
      rcReserva: "予約",
      rcReservaDirecta: "直接予約",
      rcHuesped: "宿泊者",
      rcCorreo: "メール",
      rcTelefono: "電話番号",
      rcPais: "国",
      rcHabitacion: "部屋",
      rcEntrada: "チェックイン",
      rcSalida: "チェックアウト",
      rcHuespedes: "宿泊人数",
      rcTotal: "お支払い総額",
      rcPagado: "支払済み",
      rcCheckinReal: "チェックイン済み",
      rcCheckoutReal: "チェックアウト済み",
      estadoSi: "はい",
      estadoNo: "いいえ",
      btnCheckin: "✅ オンラインで登録を完了する",
      checkinListo: "✔️ 登録は完了しています。",
      qrCheckin: "📱 スマートフォンでスキャンして登録を完了",
      qrPagar: "📱 スマートフォンでスキャンして支払いを続ける",
      qrReservar: "📱 スマートフォンでスキャンして予約",
      pagSaldo: "未払い残高：",
      pagElige: "お支払い方法を選択してください：",
      pagBtnTransfer: "🏦 銀行振込",
      pagBtnWompi: "💳 カード · Wompi (+5%)",
      pagBtnPaypal: "🅿️ PayPal",
      pagBtnCripto: "🪙 暗号資産",
      trTitulo: "🏦 銀行振込でのお支払い",
      trLlave: "Bre-B キー：",
      trNequi: "Nequi：",
      trDaviplata: "Daviplata：",
      trBancolombia: "Bancolombia 普通預金：",
      trANombre: "口座名義：",
      trReporta: "📲 WhatsApp で領収書を送ってお支払いを報告してください：",
      trBtnWhatsapp: "WhatsApp で報告",
      btnFinalizar: "完了",
      woTitulo: "💳 カードでのお支払い (Wompi)",
      woRecargo: "⚠️ この方法には5%の手数料がかかります。",
      woSaldo: "残高：",
      woTotal: "お支払い総額：",
      woBtnPagar: "Wompi で支払う",
      woEscanea: "またはこの QR コードをスキャン：",
      ppTitulo: "🅿️ PayPal でのお支払い",
      ppEnvia: "この PayPal ユーザーにお支払いください：",
      montoLbl: "金額：",
      notaTasa:
        "本日の公式レート（TRM {trm}）から300 COPを引いた、1ドルあたり{tasa}で計算。",
      ppReporta:
        "📲 その後、WhatsApp で領収書を送ってお支払いを報告してください：",
      crTitulo: "🪙 暗号資産でのお支払い",
      crBtnPagar: "暗号資産で支払う",
      calcCargando: "本日の為替レートでドル金額を計算しています…",
      errTRM:
        "現在、ドルの為替レートを取得できませんでした。数分後にもう一度お試しください。",
      kbEspacio: "スペース",
      kbBorrar: "⌫ 削除",
      kbMayus: "⇧ シフト",
      kbListo: "完了 ✓",
    },
  };

  const locales = {
    es: "es-CO",
    en: "en-US",
    de: "de-DE",
    fr: "fr-FR",
    zh: "zh-CN",
    ja: "ja-JP",
  };

  const idiomas = [
    { code: "es", flag: "🇪🇸" },
    { code: "en", flag: "🇬🇧" },
    { code: "de", flag: "🇩🇪" },
    { code: "fr", flag: "🇫🇷" },
    { code: "zh", flag: "🇨🇳" },
    { code: "ja", flag: "🇯🇵" },
  ];

  // Idioma inicial: el guardado, o el del navegador, o español.
  let actual = localStorage.getItem("kuyay_idioma");
  if (!actual || !traducciones[actual]) {
    const nav = (navigator.language || "es").slice(0, 2);
    actual = traducciones[nav] ? nav : "es";
  }

  const callbacks = [];

  function t(clave, vars) {
    const dict = traducciones[actual] || traducciones.es;
    let txt = dict[clave];
    if (txt == null) txt = traducciones.es[clave];
    if (txt == null) txt = clave;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        txt = txt.replace("{" + k + "}", vars[k]);
      });
    }
    return txt;
  }

  function aplicarEstaticas() {
    document.documentElement.lang = actual;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
  }

  let cont = null;
  function actualizarSelector() {
    if (!cont) return;
    cont.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("activo", b.dataset.idioma === actual);
    });
  }

  function crearSelector() {
    cont = document.getElementById("selector-idioma");
    if (!cont) return;
    cont.innerHTML = idiomas
      .map(
        (i) =>
          `<button type="button" data-idioma="${i.code}" title="${i.code}">${i.flag} ${i.code.toUpperCase()}</button>`
      )
      .join("");
    cont.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) setLang(b.dataset.idioma);
    });
    actualizarSelector();
  }

  function setLang(code) {
    if (!traducciones[code]) return;
    actual = code;
    localStorage.setItem("kuyay_idioma", code);
    aplicarEstaticas();
    actualizarSelector();
    callbacks.forEach((cb) => {
      try {
        cb();
      } catch (e) {}
    });
  }

  // API pública
  window.I18N = {
    t: t,
    setLang: setLang,
    onChange: function (cb) {
      callbacks.push(cb);
    },
    get lang() {
      return actual;
    },
    get locale() {
      return locales[actual] || "es-CO";
    },
  };

  // Al cargar la página: crear el selector y traducir lo estático.
  document.addEventListener("DOMContentLoaded", function () {
    crearSelector();
    aplicarEstaticas();
  });
})();
