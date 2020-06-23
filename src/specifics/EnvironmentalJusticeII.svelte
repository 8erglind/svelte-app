<script>
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;


	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	let firstSetup = true;	
	let secondSetup = false;
	let thirdSetup = false;
	let fourthSetup = false;
	let fifthSetup = false;
	let sixthSetup = false;
	let seventhSetup = false;
	let eightthSetup = false;

	const togglefirstSetup = () => {
		firstSetup = true;
		secondSetup = false;
	}
	const togglesecondSetup = () => {
		firstSetup = false;
		secondSetup = true;
		thirdSetup = false;
	}
	const togglethirdSetup = () => {
		secondSetup = false;
		thirdSetup = true;
		fourthSetup = false;
	}
	const togglefourthSetup = () => {
		thirdSetup = false;
		fourthSetup = true;
		fifthSetup = false;
	}
	const togglefifthSetup = () => {
		fourthSetup = false;
		fifthSetup = true;
		sixthSetup = false;
	}
	const togglesixthSetup = () => {
		fifthSetup = false;
		sixthSetup = true;
		seventhSetup = false;
	}
	const toggleseventhSetup = () => {
		sixthSetup = false;
		seventhSetup = true;
		eightthSetup = false;
	}
	const toggleeighthSetup = () => {
		seventhSetup = false;
		eightthSetup = true;
	}
</script>

<!--    BUTTONS    -->


{#if firstSetup}
	<div class="buttonNext" on:click={togglesecondSetup}></div>
	<a class="buttonPrev" href="{next}"></a>
{/if}
{#if secondSetup}
	<div class="buttonNext" on:click={togglethirdSetup}></div>
	<div class="buttonPrev" on:click={togglefirstSetup}></div>
{/if}
{#if thirdSetup}
	<div class="buttonNext" on:click={togglefourthSetup}></div>
	<div class="buttonPrev" on:click={togglesecondSetup}></div>
{/if}
{#if fourthSetup}
	<div class="buttonNext" on:click={togglefifthSetup}></div>
	<div class="buttonPrev" on:click={togglethirdSetup}></div>
{/if}
{#if fifthSetup}
	<div class="buttonNext" on:click={togglesixthSetup}></div>
	<div class="buttonPrev" on:click={togglefourthSetup}></div>
{/if}
{#if sixthSetup}
	<div class="buttonNext" on:click={toggleseventhSetup}></div>
	<div class="buttonPrev" on:click={togglefifthSetup}></div>
{/if}
{#if seventhSetup}
	<div class="buttonNext" on:click={toggleeighthSetup}></div>
	<div class="buttonPrev" on:click={togglesixthSetup}></div>
{/if}
{#if eightthSetup}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={toggleseventhSetup}></div>
{/if}




<!-- CONTENT -->

<div class="pagetitle" style="transform: rotate({rotate});">Radical<br>love<br>...</div>

{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		CARE<br>
		In order to love, we must care.<br>
		But care alone does not constitute love. bell claims that an abusive parent, although maybe caring, does not love it’s child. Abuse and love can not coexist and love can never excuse abuse.
	</div>	
{/if}

{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		 2. Commitment<br>
		- In order to love we must be eager and committed to abandoning or replacing abusive habits. Love, in bell’s writing, is not a practice for greater life satisfaction of the loving individual, but a deeply political act of ending domination and oppression, whether of yourself or another. Love is not for narcissistic but communal, “it requires conscious practice, a willingness to unite the way we think with the way we act.” <!--(U.N.I.T.Y. Queen Latifah)-->
 		<br>
		- *BONUS* garment workers in other countries (“only an estimated 2% of garment workers around the globe are paid a living wage.” <!-- -sustainablefashiondublin from fashion revolution)-->
	</div>	
{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		3. Knowledge:<br>
		bell asks us as consumers to call for a more accurate portrayal of love in mass media. Mass media, which more most often is produced by patriarchal institutions, historically shows love as a mystery. Something undefinable. bell describes this as being linked to patriarchal values, which depend upon inferiority / superiority, which can better be represented through violence than through love. Mass media can’t define love because the creators don’t understand love, patriarchal ideas of love are scewed by dominance and violence.<br>
		Representations of environmentalism in mass media is similarly under-developed, which is shameful because representation shapes our culture and informs our thoughts and actions. Consumers must use their power to demand nuanced representations. If love is unknowable and environmentalism is kids holding hands around a globe, then where does that lead us?<br>
		What valuable knowledge are we missing out on?
	</div>	
	<!-- LINK TO THESIS -->
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		4. Responsibility:<br>
		bell talkes of love as an action, which is informed by will and intention, rather than a feeling, which is uncontrollable, that way lending love accountability and responsibility. “If we were constantly remembering that love is as love does, we would not use the word in a manner that devalues and degrades its meaning.”
		<br>
		This means that we can choose to love (although I’m not so sure we can choose to not love). Love or lack of love is an action, an actions with consequences. In a wider context -- as love exists in many forms and “sizes” -- when speaking of groups of people, we do not simply “not love” them, we choose to not love them. Whether we choose to love them or not love them, our choice has consequences, and we are responsible for those consequences. Love is not just a feeling that we cannot control, it is an intentional action.
	</div>	
{/if}

{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	
	</div>	
{/if}

{#if sixthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Finally, love involves trust.
		<br>
		“Cultures of domination rely on the cultivation of fear as a way to ensure obedience. In our society we make much of love and say little about fear. Yet we are all terribly afraid most of the time. As a culture we are obsessed with the notion of safety. Yet we do not question why we live in states of extreme anxiety and dread. Fear is the primary force upholding structures of domination. It promotes the desire for separation, the desire not to be known. When we are taught that safety lies always with sameness, then difference, of any kind, will appear as a threat. When we choose to love we choose to move against fear-against alienation and separation. The choice to love is a choice to connect-to find ourselves in the other.
		<br>
		To love is to trust that the other will not harm us, that difference is not destructive. To not overpolice and exlude on the basis of fear.<br>
		“Awakening to love can happen only as we let go of our obsession with power and domination.”
	</div>	
{/if}

{#if seventhSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	
	</div>	
{/if}

{#if eightthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	
	</div>	
{/if}




<!-- FOOTER + STATIC -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			{#if fifthSetup}<a class="text" href="" target="_blank">[more &nearr;]</a>{/if}
			{#if sixthSetup}<a class="text" href="" target="_blank">[more &nearr;] <a href="" target="_blank">[more &nearr;].</a></a>{/if}
		</div>
</div>

<div class="horizontalLine left" style="width: 100%; top: calc({distanceBLines} * 8); border-top: 1px solid blue;"></div>

<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>

	.text, .text a, .pagetext {color: rgb(70,70,70) !important;}
	.verticalLine {border-right: 1px dotted rgb(70,70,70);}
	.horizontalLine {border-top: 1px dotted rgb(70,70,70); width: 100%;}
	.line {background-color: rgb(70,70,70);}
	.tempMeterCountry {
		border-left: 1px solid rgb(70,70,70); 
		border-right: 1px solid rgb(70,70,70);
	}
	.firstMeter, .midMeter, .endMeter {border-left: 1px dotted rgb(70,70,70);}
	.firstMeter {width: calc(((100% / 365) * 23) - 1px);}
	.midMeter {width: calc(((100% / 365) * 45) - 1px);}
	.endMeter {width: calc(((100% / 365) * 127) - 1px);}
	.firstMeter:after, .midMeter:after, .endMeter:after {border-right: 1px dotted rgb(70,70,70);}
	.rightFirst {right: calc(((100vw / 365) * 23) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 45) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 127) - 1px);}

</style>