---
title: Установка Nginx
description: Первая установка NGINX Open Source на Ubuntu и Debian из официального репозитория — ключи подписи, выбор ветки и проверка пакета.
sidebarOrder: 20
---

# Установка Nginx

Установим NGINX Open Source из официального репозитория на новый сервер с Ubuntu или Debian. Результат — установленный пакет выбранной ветки, проверенные версия, расположение исполняемого файла и конфигурация.

## Перед началом

Нужны доступ к серверу по SSH, пользователь с `sudo` и выход в интернет. Команды выполняются в терминале Linux. Инструкция рассчитана на первую установку; если Nginx уже установлен, сначала выясните источник пакета и сохраните действующую конфигурацию.

На **24 октября 2026 года** официальный репозиторий поддерживает Ubuntu 22.04, 24.04 и 26.04, Debian 12 и 13 на `amd64` и `arm64`. Перед установкой сверьтесь со [списком поддерживаемых систем](https://nginx.org/en/linux_packages.html#distributions).

Посмотрите свою систему и архитектуру:

```sh
. /etc/os-release
printf '%s; codename=%s\n' "$PRETTY_NAME" "$VERSION_CODENAME"
dpkg --print-architecture
```

## 1. Выберите источник и ветку

Пакеты доступны как в репозитории дистрибутива, так и на `nginx.org`. В этой серии используем **официальный репозиторий Nginx и mainline**. Различия веток разобраны в статье [«Версии»](./versions), варианты установки — в [руководстве NGINX](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/#distribution-and-installation-methods).

Для stable ниже достаточно выбрать другой адрес репозитория. Подключайте одну ветку.

## 2. Подготовьте инструменты и ключи

Выполните блок для своей системы:

::: code-group

```sh [Ubuntu]
sudo apt update
sudo apt install curl gnupg2 ca-certificates ubuntu-keyring
```

```sh [Debian]
sudo apt update
sudo apt install curl gnupg2 ca-certificates debian-archive-keyring
```

:::

Сохраните ключи репозитория в отдельный файл и выведите их отпечатки:

```sh
sudo install -d -m 0755 /etc/apt/keyrings
sudo curl -fsSL https://nginx.org/keys/nginx_signing.key \
  -o /etc/apt/keyrings/nginx.asc
sudo chmod 0644 /etc/apt/keyrings/nginx.asc
gpg --show-keys --with-fingerprint /etc/apt/keyrings/nginx.asc
```

На дату подготовки [NGINX публикует три полных отпечатка](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/#debian-packages):

```text
8540A6F18833A80E9C1653A42FD21310B49F6B46
573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
9E9BE90EACBCDE69FE9B204CBCDCD8A38D88A2B3
```

Сравнивайте полные отпечатки, игнорируя пробелы в выводе. Продолжайте только при совпадении набора ключей с актуальной официальной документацией. `gpg --show-keys` показывает содержимое файла без импорта ключей в ваше хранилище. [Параметры GnuPG](https://www.gnupg.org/documentation/manuals/gnupg24/gpg.1.html).

## 3. Подключите репозиторий

Выполните блок целиком. Переменные `ID` и `VERSION_CODENAME` берутся из установленной системы, например `ubuntu` и `noble`, либо `debian` и `trixie`.

```sh
. /etc/os-release
nginx_repo=https://nginx.org/packages/mainline

sudo tee /etc/apt/sources.list.d/nginx.sources >/dev/null <<EOF
Types: deb
URIs: ${nginx_repo}/${ID}
Suites: ${VERSION_CODENAME}
Components: nginx
Signed-By: /etc/apt/keyrings/nginx.asc
EOF
```

Для **stable** замените значение `nginx_repo` в этом блоке на `https://nginx.org/packages` и выполните блок с выбранным значением. Соответствие адресов веткам описано в [инструкции Nginx](https://nginx.org/en/linux_packages.html#instructions).

Файл `.sources` использует формат deb822. Поле `Signed-By` связывает этот источник с отдельным файлом ключей; `apt-key` не требуется. См. [формат sources.list](https://manpages.debian.org/trixie/apt/sources.list.5.en.html#DEB822-STYLE_FORMAT) и [проверку подлинности APT](https://manpages.debian.org/trixie/apt/apt-secure.8.en.html#USER_CONFIGURATION).

## 4. Проверьте, какой пакет выберет APT

Задайте приоритет для Nginx и его модулей из `nginx.org`:

```sh
sudo tee /etc/apt/preferences.d/99nginx >/dev/null <<'EOF'
Package: nginx nginx-module-*
Pin: origin "nginx.org"
Pin-Priority: 900
EOF

sudo apt update
LC_ALL=C apt-cache policy nginx
```

В поле `Candidate` указана версия, выбранная для установки. Найдите её в таблице версий в выводе этой же команды: источник должен быть `nginx.org` с выбранной веткой и вашей системой. Для него ожидается приоритет `900`.

Если APT выбирает пакет из репозитория Ubuntu/Debian, проверьте адрес, кодовое имя выпуска и файл приоритетов до установки. Как работают приоритеты и вывод `policy`: [apt_preferences](https://manpages.debian.org/trixie/apt/apt_preferences.5.en.html), [apt-cache](https://manpages.debian.org/trixie/apt/apt-cache.8.en.html).

## 5. Установите Nginx

```sh
sudo apt install nginx
```

Просмотрите предложенные изменения пакетов и подтвердите установку.

## 6. Как проверить, что Nginx установлен

Проверим пакет, исполняемый файл, его версию и конфигурацию. Проверки выполняйте на том сервере, где устанавливали Nginx. `LC_ALL=C` делает служебные сообщения англоязычными, чтобы их можно было сопоставить с примерами ниже.

### Статус пакета

```sh
LC_ALL=C dpkg-query -W -f='Package: ${binary:Package}\nStatus: ${Status}\nVersion: ${Version}\n' nginx
```

Структура ответа, где `<package-version>` — фактический номер вашей сборки:

```text
Package: nginx
Status: install ok installed
Version: <package-version>
```

Для обычной установки ожидается `install ok installed`: пакет распакован и настроен. Если пакет поставлен на удержание обновлений, первое слово может быть `hold`; состояние `ok installed` по-прежнему означает установленный пакет.

| Другой результат | Что он означает |
| --- | --- |
| `deinstall ok config-files` | Пакет удалён, остались конфигурационные файлы |
| `unpacked` или `half-configured` в конце статуса | Установка или настройка пакета не завершена |
| `no packages found matching nginx` | В базе dpkg нет подходящей записи о пакете |

Эта проверка относится к пакетам dpkg. Nginx, собранный вручную и установленный в другой каталог, может существовать без записи о пакете. Описание [dpkg-query](https://manpages.debian.org/trixie/dpkg/dpkg-query.1.en.html) и [состояний пакета](https://manpages.debian.org/trixie/dpkg/dpkg.1.en.html#INFORMATION_ABOUT_PACKAGES).

### Исполняемый файл и его расположение

Посмотрите список файлов пакета:

```sh
dpkg-query -L nginx
```

Для рассматриваемой пакетной установки ожидаем `/usr/sbin/nginx` и `/etc/nginx/nginx.conf`. Проверьте наличие бинарного файла и пакет, которому принадлежит этот путь:

```sh
ls -l /usr/sbin/nginx
dpkg-query -S /usr/sbin/nginx
```

Первая команда должна показать файл с правами выполнения (`x`), вторая — запись `nginx: /usr/sbin/nginx`. Если файл отсутствует, одной записи в базе пакетов недостаточно: разберитесь, почему содержимое пакета не соответствует установленному состоянию.

### Версия и параметры сборки

Обратитесь к бинарному файлу по полному пути, чтобы не зависеть от `PATH` и другой установки Nginx:

```sh
sudo /usr/sbin/nginx -v
sudo /usr/sbin/nginx -V
```

`-v` выводит строку вида `nginx version: nginx/<nginx-version>`. Сравнивайте номер Nginx с основной частью версии пакета: суффикс пакетной сборки в этой строке не отображается.

`-V` дополнительно показывает компилятор и параметры сборки. В частности, `--conf-path` задаёт стандартный путь к конфигурации, `--sbin-path` — путь установки исполняемого файла, а параметры `--with-…` описывают включённые при сборке возможности. См. [параметры командной строки](https://nginx.org/en/docs/switches.html) и [настройки сборки](https://nginx.org/en/docs/configure.html).

### Установленная версия и источник

```sh
LC_ALL=C apt-cache policy nginx
```

- `Installed` — установленная версия пакета; `(none)` означает, что APT не видит установленного пакета.
- `Candidate` — версия, которую APT выберет для установки или обновления. Она может быть новее установленной.
- В таблице версий найдите номер из `Installed` и соответствующий адрес `nginx.org` с выбранной веткой.

Строка `/var/lib/dpkg/status` относится к локальному учёту пакетов. Сам вывод `policy` сопоставляет версии с доступными сейчас источниками, но не хранит историю первоначальной установки. В нашем сценарии сверяйте выбранную перед установкой версию `Candidate` с полученной `Installed`. [Описание apt-cache](https://manpages.debian.org/trixie/apt/apt-cache.8.en.html).

### Проверка конфигурации

```sh
sudo /usr/sbin/nginx -t
```

Для стандартной конфигурации успешный ответ выглядит так:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

`-t` проверяет синтаксис и возможность открыть файлы, указанные в конфигурации. Команда не запускает службу и не применяет изменения к работающему процессу. При ошибке прочитайте путь и номер строки в сообщении: установленный бинарный файл может работать, даже если конфигурация требует исправления.

### Установлен ли Nginx или уже запущен

Наличие пакета и состояние службы — отдельные проверки. На сервере с systemd состояние можно посмотреть без запуска или остановки Nginx:

```sh
systemctl is-active nginx
```

| Ответ | Значение |
| --- | --- |
| `active` | Служба активна |
| `inactive` | Служба не активна; пакет при этом может быть установлен |
| `failed` | Служба завершилась с ошибкой; это не означает отсутствие пакета |

Даже `active` само по себе не подтверждает доступность сайта по HTTP: на неё влияют адрес прослушивания, порт, конфигурация и сеть. Подробнее о состояниях службы — в [документации systemctl](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html#is-active%20PATTERN%E2%80%A6).

## Если что-то пошло не так

| Симптом | Что проверить |
| --- | --- |
| `404` или сообщение об отсутствии `Release` | Совпадают ли `ID` и кодовое имя с поддерживаемой системой. Не подставляйте кодовое имя другого выпуска |
| `NO_PUBKEY` или ошибка подписи | Успешно ли скачан ключ, совпадают ли отпечатки, существует ли файл из `Signed-By` и доступен ли он для чтения |
| `Conflicting values set for option Signed-By` | Нет ли второго подключения того же репозитория в другом `.list` или `.sources`; оставьте одну согласованную запись |
| `Candidate: (none)` или выбран пакет дистрибутива | Завершился ли `apt update` без ошибок, верны ли адрес и приоритет источника |
| `nginx: command not found` | Есть ли пакет и файл `/usr/sbin/nginx`; если файл существует, проверьте команду по полному пути и значение `PATH` |
| Ошибка при `nginx -t` | Какой файл и строку указывает сообщение; проверьте синтаксис, пути и права доступа |

При ошибке подписи исправьте ключ или подключение источника, сохранив проверку подлинности пакетов.
