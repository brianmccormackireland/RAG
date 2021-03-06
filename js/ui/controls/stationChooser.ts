/** Rail Announcements Generator. By Roy Curtis, MIT license, 2018 */

///<reference path="chooser.ts"/>

// TODO: Search by station code

/**
 * Singleton instance of the station picker. Since there are expected to be 2500+
 * stations, this element would take up a lot of memory and generate a lot of DOM. So, it
 * has to be "swapped" between pickers and views that want to use it.
 */
class StationChooser extends Chooser
{
    /** Shortcut references to all the generated A-Z station list elements */
    private readonly domStations : Dictionary<HTMLDListElement> = {};

    public constructor(parent: HTMLElement)
    {
        super(parent);

        this.inputChoices.tabIndex = 0;

        // Populates the list of stations from the database. We do this by creating a dl
        // element for each letter of the alphabet, creating a dt element header, and then
        // populating the dl with station name dd children.
        Object.keys(RAG.database.stations).forEach( this.addStation.bind(this) );
    }

    /**
     * Attaches this control to the given parent and resets some state.
     *
     * @param picker Picker to attach this control to
     * @param onSelect Delegate to fire when choosing a station
     */
    public attach(picker: Picker, onSelect: SelectDelegate) : void
    {
        let parent  = picker.domForm;
        let current = this.dom.parentElement;

        // Re-enable all disabled elements
        this.inputChoices.querySelectorAll(`dd[disabled]`)
            .forEach( this.enable.bind(this) );

        if (!current || current !== parent)
            parent.appendChild(this.dom);

        this.visualUnselect();
        this.onSelect = onSelect.bind(picker);
    }

    /** Pre-selects a station entry by its code */
    public preselectCode(code: string) : void
    {
        let entry = this.getByCode(code);

        if (!entry) return;

        this.visualSelect(entry);
        entry.focus();
    }

    /** Enables the given station code or station element for selection */
    public enable(codeOrNode: string | HTMLElement) : void
    {
        let entry = (typeof codeOrNode === 'string')
            ? this.getByCode(codeOrNode)
            : codeOrNode;

        if (!entry) return;

        entry.removeAttribute('disabled');
        entry.tabIndex = -1;
        entry.title    = this.itemTitle;
    }

    /** Disables the given station code from selection */
    public disable(code: string) : void
    {
        let entry = this.getByCode(code);
        let next  = DOM.getNextFocusableSibling(entry, 1);

        if (!entry) return;

        entry.setAttribute('disabled', '');
        entry.removeAttribute('tabindex');
        entry.title = '';

        // Shift focus to next available element, for keyboard navigation
        if (next)
            next.focus();
    }

    /** Gets a station's choice element by its code */
    private getByCode(code: string) : HTMLElement
    {
        return this.inputChoices
            .querySelector(`dd[data-code=${code}]`) as HTMLElement;
    }

    /** Populates the chooser with the given station code */
    private addStation(code: string) : void
    {
        let station = RAG.database.getStation(code);
        let letter  = station[0];
        let group   = this.domStations[letter];

        if (!group)
        {
            let header       = document.createElement('dt');
            header.innerText = letter.toUpperCase();
            header.tabIndex  = -1;

            group = this.domStations[letter] = document.createElement('dl');
            group.tabIndex = 50;

            group.setAttribute('group', '');
            group.appendChild(header);
            this.inputChoices.appendChild(group);
        }

        let entry             = document.createElement('dd');
        entry.dataset['code'] = code;
        entry.innerText       = station;
        entry.title           = this.itemTitle;
        entry.tabIndex        = -1;

        group.appendChild(entry);
    }
}