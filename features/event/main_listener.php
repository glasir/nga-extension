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
		$this->configure_autocard($configurator, 'c');
		$this->configure_autocard($configurator, 'card');
	}

	private function configure_autocard($configurator, $tag)
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
}
