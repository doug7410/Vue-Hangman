<?php

require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

class WordsApi {
    private $client;

    public function __construct()
    {
        $dotenv = new Dotenv\Dotenv(__DIR__);
        $dotenv->load();
        $this->client = new Client([
            'base_uri' => 'https://od-api.oxforddictionaries.com:443',
            'headers' => [
                "Accept" => "application/json",
                "app_id" => getenv('APP_ID'),
                "app_key" => getenv('APP_KEY')
            ]
        ]);
        $this->fillCategories();
    }

    private function fillCategories()
    {
        if (empty($_SESSION['categories'])) {
            $categories = collect(json_decode(
                $this->client->get('/api/v1/domains/en')->getBody()->getContents(),
                true
            ))->get('results');

            $_SESSION['categories'] = collect($categories)->map(function ($category, $id) {
                return [
                    'id' => $id,
                    'name' => $category['en']
                ];
            });
        }
    }

    private function getRandomCategory()
    {
        $category = collect($_SESSION['categories'])->random();
        return $category;
    }

    public function getWordAndCategory() {
        $category = $this->getRandomCategory();
        try {
            $wordsRequest = $this->client->get("/api/v1/wordlist/en/domains={$category['id']}");
            return collect([
                'category' => $category['name'],
                'word' =>
                    collect(
                    json_decode($wordsRequest->getBody()->getContents(), true)['results'])
                        ->random()['word']

            ]);
        } catch (ClientException $e) {
            return collect([
                $e->getCode(),
                $e->getMessage()
            ]);
        }
    }
}

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
$wordsApi = new WordsApi();
 echo $wordsApi->getWordAndCategory()->toJson();