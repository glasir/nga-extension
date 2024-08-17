<?php
/**
 *
 * NGA Feature Bundle. An extension for the phpBB Forum Software package.
 *
 * @copyright (c) 2024, Glasir
 * @license GNU General Public License, version 2 (GPL-2.0)
 *
 */

namespace nogoblinsallowed\features\event;

/**
 * @ignore
 */
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * NGA Feature Bundle Event listener.
 */
class main_listener implements EventSubscriberInterface
{
	public static function getSubscribedEvents()
	{
		return [
			'core.text_formatter_s9e_configure_after' => 'configure_bbcodes',
		];
	}

	public function configure_bbcodes($event)
	{
		$configurator = $event['configurator'];

		// Set up autocard bbcodes.
		$this->add_autocard_bbcode($configurator, 'c');
		$this->add_autocard_bbcode($configurator, 'card');

		// Set up the table bbcode.
		$this->add_table_bbcode($configurator);
	}

	private function add_autocard_bbcode($configurator, $tag)
	{
		unset($configurator->BBCodes[$tag]);
		unset($configurator->tags[$tag]);

		$configurator->BBCodes->addCustom(
			"[$tag name={TEXT;useContent;postFilter=rawurlencode}]{TEXT}[/$tag]",
			'<a
				class="autocard"
				href="https://scryfall.com/search?q=!%22{@name}%22"
				img-url="https://gatherer.wizards.com/Handlers/Image.ashx?type=card&name={@name}"
			>	
				<xsl:apply-templates/>
			</a>'
		);
	}

	private function add_table_bbcode($configurator)
	{
		unset($configurator->BBCodes['table']);
		unset($configurator->tags['table']);

		$configurator->BBCodes->addCustom(
			'[table={SIMPLETEXT}]{TEXT}[/table]',
			'<span class="table" options="{SIMPLETEXT}">{TEXT}</span>'
		);
	}
}
